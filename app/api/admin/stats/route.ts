import { requireAdmin } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    await requireAdmin();

    const [totalUsers, adminCount, customerCount, totalFields, totalCrops, totalReports] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: { role_name: 'Admin' } } }),
        prisma.user.count({ where: { role: { role_name: 'Customer' } } }),
        prisma.field.count(),
        prisma.crop.count({ where: { status: 'Active' } }),
        prisma.cropReport.count(),
      ]);

    // Aggregate fields by district
    const fieldsByDistrict = await prisma.field.groupBy({
      by: ['district'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // For each district, get active crop count
    const districtStats = await Promise.all(
      fieldsByDistrict.map(async (d) => {
        const fields = await prisma.field.findMany({
          where: { district: d.district },
          select: { id: true },
        });
        const fieldIds = fields.map((f) => f.id);
        const activeCrops = await prisma.crop.count({
          where: { field_id: { in: fieldIds }, status: 'Active' },
        });
        const reports = await prisma.cropReport.count({
          where: { field_id: { in: fieldIds } },
        });
        // Simple risk score: high if many reports relative to fields
        const riskScore = reports > 0 ? Math.min(100, Math.round((reports / d._count.id) * 30)) : 0;
        const riskLevel = riskScore >= 60 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low';
        return {
          district: d.district,
          fields: d._count.id,
          activeCrops,
          reports,
          riskScore,
          riskLevel,
        };
      })
    );

    return json({
      success: true,
      data: {
        totalUsers,
        adminCount,
        customerCount,
        totalFields,
        totalCrops,
        totalReports,
        districtStats,
      },
    });
  } catch (err) {
    return errorJson(err);
  }
}
