import { useTranslation } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Сменить язык / Switch Language">
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('ru')}
          className={`cursor-pointer flex items-center justify-between gap-3 ${
            language === 'ru' ? 'font-semibold text-primary' : ''
          }`}
        >
          <span>🇷🇺 Русский</span>
          {language === 'ru' && <span className="text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={`cursor-pointer flex items-center justify-between gap-3 ${
            language === 'en' ? 'font-semibold text-primary' : ''
          }`}
        >
          <span>🇬🇧 English</span>
          {language === 'en' && <span className="text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
