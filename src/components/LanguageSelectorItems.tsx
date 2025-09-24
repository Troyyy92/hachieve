"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface LanguageSelectorItemsProps {
  onSelect?: () => void; // Optional callback to close parent dropdown
}

export function LanguageSelectorItems({ onSelect }: LanguageSelectorItemsProps) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    onSelect?.(); // Call onSelect if provided
  };

  return (
    <>
      <DropdownMenuItem onClick={() => changeLanguage('fr')} className={i18n.language === 'fr' ? 'font-bold' : ''}>
        Français
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'font-bold' : ''}>
        English
      </DropdownMenuItem>
    </>
  );
}