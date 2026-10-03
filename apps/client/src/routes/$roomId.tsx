import { createFileRoute, Navigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { GameView } from '@/components/GameView';
import { useSocket } from '@/hooks/useSocket';
import { validateRoomId } from '@who-am-i/shared';
import { useTranslation } from '@/i18n';

export const Route = createFileRoute('/$roomId')({
  component: RoomRouteComponent,
});

function RoomRouteComponent() {
  const { t } = useTranslation();
  const { roomId } = Route.useParams();
  const validation = validateRoomId(roomId);

  const socketController = useSocket(roomId);

  if (!validation.valid) {
    toast.error(t('invalidRoomId'));
    return <Navigate to="/" />;
  }

  if (!socketController) {
    return null;
  }

  return <GameView sc={socketController} />;
}
