import { useState, useEffect, useRef } from 'react';
import type { Player } from '@/store/game';
import type { SocketController } from '@/store/socket-controller';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserRoundPen, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { validatePlayerName, validateAvatarFile } from '@who-am-i/shared';

interface EditPlayerProps {
  player: Player;
  open: boolean;
  onOpenChange(open: boolean): void;
  sc: SocketController;
}

export default function EditPlayer({ player, open, onOpenChange, sc }: EditPlayerProps) {
  const [name, setName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate({ from: '/$roomId' });

  useEffect(() => {
    setName(player.name);
    setPreviewUrl(player.avatar);
  }, [open, player.name, player.avatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile({ size: file.size, type: file.type });
    if (!validation.valid) {
      toast.error(validation.error || 'Недопустимый файл');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleSave = async () => {
    const nameValidation = validatePlayerName(name);
    if (!nameValidation.valid) {
      toast.error(nameValidation.error || 'Пожалуйста, введите корректное имя');
      return;
    }

    const file = fileInputRef.current?.files?.[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      setIsUploading(true);

      try {
        const link = await sc.uploadImg(formData);
        sc.sendMyAvatar(link);
        localStorage.setItem('game-avatar', link);
        setPreviewUrl(link);
      } catch (err) {
        console.error('Avatar upload failed:', err);
        toast.error('Не удалось загрузить аватар на сервер');
      } finally {
        setIsUploading(false);
      }
    }

    sc.sendMyName(name.trim());
    localStorage.setItem('game-name', name.trim());
    toast.success('Профиль успешно обновлен');
    onOpenChange(false);
  };

  const handleResetSession = () => {
    localStorage.removeItem('socket_id');
    localStorage.removeItem('game-name');
    localStorage.removeItem('game-avatar');
    toast.info('Сессия сброшена');
    navigate({ to: '/' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Редактировать профиль">
          <UserRoundPen className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование профиля</DialogTitle>
          <DialogDescription>
            Ваше имя и аватар будут видны всем участникам комнаты.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <div className="relative size-16 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="size-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="avatar-file" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                  <Upload className="size-4" />
                  {previewUrl ? 'Изменить аватар' : 'Загрузить аватар'}
                </div>
                <span className="text-xs text-muted-foreground block mt-1">
                  PNG, JPEG, WebP до 2 МБ
                </span>
              </Label>
              <Input
                ref={fileInputRef}
                id="avatar-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <Label htmlFor="player-name">Ваше имя в игре</Label>
            <Input
              id="player-name"
              placeholder="Например: Шерлок"
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </div>

          {/* Connection ID & Reset */}
          <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
            <p>ID подключения: <span className="font-mono text-foreground">{sc.socket.id}</span></p>
            <p>Если возникают неполадки с соединением, можно сбросить сессию.</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetSession}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            <RefreshCw className="size-3 mr-1" /> Сбросить сессию
          </Button>
          <Button
            type="button"
            disabled={isUploading}
            onClick={handleSave}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}