import { requireAdmin } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

export async function GET() {
  try {
    await requireAdmin();

    const [totalUsers, totalAdmins, totalFarmers, totalFields, totalCropReports] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: { role_name: 'Admin' } } }),
        prisma.user.count({ where: { role: { role_name: 'Customer' } } }),
        prisma.field.count(),
        prisma.cropReport.count(),
      ]);

    const [pendingReports, approvedReports, rejectedReports, activeReports] =
      await Promise.all([
        prisma.cropReport.count({ where: { status: 'Pending' } }),
        prisma.cropReport.count({ where: { status: 'Approved' } }),
        prisma.cropReport.count({ where: { status: 'Rejected' } }),
        prisma.cropReport.count({ where: { NOT: { status: 'Rejected' } } }),
      ]);

    // Reports created today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const reportsToday = await prisma.cropReport.count({
      where: { created_at: { gte: startOfToday } },
    });

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

    // Reports by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const recentReports = await prisma.cropReport.findMany({
      where: { created_at: { gte: sevenDaysAgo } },
      select: { created_at: true },
    });
    const reportsByDayMap = new Map<string, number>();
    for (const r of recentReports) {
      const key = r.created_at.toISOString().slice(0, 10); // YYYY-MM-DD
      reportsByDayMap.set(key, (reportsByDayMap.get(key) ?? 0) + 1);
    }
    const reportsByDay = Array.from(reportsByDayMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));

    // Reports by type / status
    const allReports = await prisma.cropReport.findMany({
      select: { type: true, status: true },
    });
    const typeMap = new Map<string, number>();
    const statusMap = new Map<string, number>();
    for (const r of allReports) {
      typeMap.set(r.type, (typeMap.get(r.type) ?? 0) + 1);
      statusMap.set(r.status, (statusMap.get(r.status) ?? 0) + 1);
    }
    const reportsByType = Array.from(typeMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));
    const reportsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // Recent activity
    const recentActivity = await prisma.activityLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalFarmers,
        totalFields,
        totalCropReports,
        pendingReports,
        approvedReports,
        rejectedReports,
        activeReports,
        reportsToday,
        recentActivity,
        reportsByDay,
        reportsByType,
        reportsByStatus,
        districtStats,
      },
    });
  } catch (err) {
    return errorJson(err);
  }
}
