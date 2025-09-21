import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (isEnglish: boolean) => {
    const lang = isEnglish ? "en" : "fr";
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="language-switch" className="text-sm font-medium">FR</Label>
      <Switch
        id="language-switch"
        checked={i18n.language === "en"}
        onCheckedChange={handleLanguageChange}
      />
      <Label htmlFor="language-switch" className="text-sm font-medium">EN</Label>
    </div>
  );
};