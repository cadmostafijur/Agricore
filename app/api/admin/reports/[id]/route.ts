import { requireAdmin } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { json, errorJson } from '@/app/api/_utils/response';

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return json({ success: false, message: 'Invalid report ID.' }, { status: 400 });
    }

    const { status } = (await req.json()) as { status?: 'Pending' | 'Approved' | 'Rejected' };
    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return json(
        { success: false, message: 'Status must be Pending, Approved, or Rejected.' },
        { status: 400 }
      );
    }

    const existing = await prisma.cropReport.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing) {
      return json({ success: false, message: 'Report not found.' }, { status: 404 });
    }

    const updated = await prisma.cropReport.update({
      where: { id },
      data: {
        status,
        reviewed_at: new Date(),
      },
    });

    // Notification to farmer
    const title =
      status === 'Approved'
        ? 'Crop report approved'
        : status === 'Rejected'
        ? 'Crop report rejected'
        : 'Crop report updated';
    const message =
      status === 'Approved'
        ? `Your report "${existing.title}" has been approved.`
        : status === 'Rejected'
        ? `Your report "${existing.title}" was rejected. Please review and update it if needed.`
        : `Your report "${existing.title}" status was changed.`;

    await prisma.notification.create({
      data: {
        user_id: existing.user_id,
        title,
        message,
        type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'info',
      },
    });

    await prisma.activityLog.create({
      data: {
        user_id: null,
        action: `${status} crop report`,
        entity: 'CropReport',
        entity_id: id,
        metadata: { title: existing.title },
      },
    });

    return json({ success: true, data: { report: updated } });
  } catch (err) {
    return errorJson(err);
  }
}

