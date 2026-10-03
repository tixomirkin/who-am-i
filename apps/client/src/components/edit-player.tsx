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
import {
  Loader2,
  UserRoundPen,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { validatePlayerName } from '@who-am-i/shared';

interface EditPlayerProps {
  player: Player;
  open: boolean;
  onOpenChange(open: boolean): void;
  sc: SocketController;
}

// Built-in presets with SVGs / Data-URIs for instant, fun avatar selection
const AVATAR_PRESETS = [
  { id: 'detective', name: 'Детектив', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=detective' },
  { id: 'wizard', name: 'Маг', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=wizard' },
  { id: 'robot', name: 'Робот', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot' },
  { id: 'alien', name: 'Пришелец', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=alien' },
  { id: 'ninja', name: 'Ниндзя', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ninja' },
  { id: 'cat', name: 'Кот', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cat' },
  { id: 'bear', name: 'Медведь', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bear' },
  { id: 'superhero', name: 'Герой', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=superhero' },
];

/**
 * Resizes and compresses an image file to a lightweight data URL (max 200x200)
 */
function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 200;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to WebP or JPEG Data URL (compact ~15-25KB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Поддерживаются только изображения');
      return;
    }

    try {
      setIsUploading(true);
      const compressedDataUrl = await compressImageToDataUrl(file);
      setPreviewUrl(compressedDataUrl);
      toast.success('Изображение подготовлено');
    } catch {
      toast.error('Не удалось обработать изображение');
    } finally {
      setIsUploading(false);
    }
  };

  const selectPreset = (url: string) => {
    setPreviewUrl(url);
  };

  const handleSave = async () => {
    const nameValidation = validatePlayerName(name);
    if (!nameValidation.valid) {
      toast.error(nameValidation.error || 'Пожалуйста, введите корректное имя');
      return;
    }

    const trimmedName = name.trim();
    sc.sendMyName(trimmedName);
    localStorage.setItem('game-name', trimmedName);

    if (previewUrl !== player.avatar) {
      sc.sendMyAvatar(previewUrl);
      if (previewUrl) {
        localStorage.setItem('game-avatar', previewUrl);
      } else {
        localStorage.removeItem('game-avatar');
      }
    }

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
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4">
            <div className="relative size-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shrink-0">
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
                  {previewUrl ? 'Загрузить другое фото' : 'Загрузить фото'}
                </div>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  PNG, JPEG, WebP (автоматическое сжатие)
                </span>
              </Label>
              <Input
                ref={fileInputRef}
                id="avatar-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Instant Presets */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Или выберите готовую аватарку:
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = previewUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset.url)}
                    className={`relative p-1 rounded-xl border transition-all flex flex-col items-center gap-1 hover:bg-muted ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 bg-primary/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="size-10 rounded-lg object-cover"
                    />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 size-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="size-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
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

          {/* Connection Info */}
          <div className="p-2.5 bg-muted/50 rounded-lg text-xs text-muted-foreground flex items-center justify-between">
            <span>ID: <span className="font-mono text-foreground">{sc.socket.id?.slice(0, 8)}...</span></span>
            <button
              type="button"
              onClick={handleResetSession}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
            >
              <RefreshCw className="size-3" /> Сбросить ID
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={isUploading}
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Обработка...
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