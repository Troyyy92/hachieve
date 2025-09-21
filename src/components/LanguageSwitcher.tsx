import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (isEnglish: boolean) => {
    const lang = isEnglish ? "en" : "fr";
    i18n.changeLanguage(lang);
  };

  const isEnglish = i18n.language.startsWith('en');

  return (
    <div className="flex items-center space-x-2">
      <Label
        htmlFor="language-switch"
        className={cn(
          "text-sm font-medium transition-colors cursor-pointer",
          !isEnglish ? "text-foreground" : "text-muted-foreground"
        )}
      >
        FR
      </Label>
      <Switch
        id="language-switch"
        checked={isEnglish}
        onCheckedChange={handleLanguageChange}
        className="data-[state=checked]:bg-input"
      />
      <Label
        htmlFor="language-switch"
        className={cn(
          "text-sm font-medium transition-colors cursor-pointer",
          isEnglish ? "text-foreground" : "text-muted-foreground"
        )}
      >
        EN
      </Label>
    </div>
  );
};