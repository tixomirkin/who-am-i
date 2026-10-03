import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import type { SocketController } from '@/store/socket-controller';
import { useGameStore } from '@/hooks/useGameStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Shuffle,
  ArrowRight,
  ArrowLeft,
  Crown,
} from 'lucide-react';
import type { CharacterAssignmentMode } from '@who-am-i/shared';
import { toast } from 'sonner';

interface GameSettingsDialogProps {
  sc: SocketController;
  open: boolean;
  onOpenChange(open: boolean): void;
}

export const GameSettingsDialog = observer(
  ({ sc, open, onOpenChange }: GameSettingsDialogProps) => {
    const gameStore = useGameStore();
    const isMeAdmin = gameStore.isGameAdmin;

    const [assignmentMode, setAssignmentMode] = useState<CharacterAssignmentMode>(
      gameStore.settings.assignmentMode
    );
    const [allowSpectatorViewing, setAllowSpectatorViewing] = useState(
      gameStore.settings.allowSpectatorViewing
    );

    useEffect(() => {
      setAssignmentMode(gameStore.settings.assignmentMode);
      setAllowSpectatorViewing(gameStore.settings.allowSpectatorViewing);
    }, [gameStore.settings, open]);

    const handleSave = () => {
      if (!isMeAdmin) {
        toast.error('Только администратор может изменять настройки игры');
        return;
      }

      sc.sendUpdateSettings({
        assignmentMode,
        allowSpectatorViewing,
      });

      toast.success('Настройки игры обновлены');
      onOpenChange(false);
    };

    const modes: {
      id: CharacterAssignmentMode;
      title: string;
      desc: string;
      icon: typeof Shuffle;
    }[] = [
      {
        id: 'free',
        title: 'Свободный режим',
        desc: 'Каждый игрок может загадать персонажа любому другому игроку',
        icon: Shuffle,
      },
      {
        id: 'neighbor_right',
        title: 'По кругу (соседу справа ➡️)',
        desc: 'Каждый игрок загадывает персонажа следующему игроку по часовой стрелке',
        icon: ArrowRight,
      },
      {
        id: 'neighbor_left',
        title: 'По кругу (соседу слева ⬅️)',
        desc: 'Каждый игрок загадывает персонажа предыдущему игроку против часовой стрелки',
        icon: ArrowLeft,
      },
      {
        id: 'admin_only',
        title: 'Только ведущий 👑',
        desc: 'Администратор комнаты единолично загадывает персонажей всем участникам',
        icon: Crown,
      },
    ];

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            title="Настройки игры"
            className="relative"
          >
            <Settings className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-5 text-primary" /> Настройки комнаты
            </DialogTitle>
            <DialogDescription>
              {isMeAdmin
                ? 'Настройте правила распределения персонажей и параметры комнаты.'
                : 'Просмотр текущих настроек игры (изменять может только администратор).'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Режим загадывания персонажей
              </Label>
              <div className="space-y-2">
                {modes.map((m) => {
                  const Icon = m.icon;
                  const isSelected = assignmentMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!isMeAdmin}
                      onClick={() => setAssignmentMode(m.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                      } ${!isMeAdmin ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground flex items-center justify-between">
                          <span>{m.title}</span>
                          {isSelected && (
                            <span className="text-xs font-semibold text-primary">Активен</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin transfer list if admin */}
            {isMeAdmin && gameStore.activePlayers.length > 1 && (
              <div className="pt-2 border-t border-border">
                <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Передать права администратора
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {gameStore.activePlayers
                    .filter((p) => p.id !== gameStore.myId)
                    .map((player) => (
                      <Button
                        key={player.id}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          sc.sendSetAdmin(player.id);
                          toast.success(`Права администратора переданы игроку ${player.displayName}`);
                        }}
                      >
                        <Crown className="size-3 mr-1 text-amber-500" />
                        {player.displayName}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Закрыть
            </Button>
            {isMeAdmin && (
              <Button type="button" onClick={handleSave}>
                Сохранить настройки
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);
