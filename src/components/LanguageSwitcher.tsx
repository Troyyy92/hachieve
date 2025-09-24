"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { LanguageSelectorItems } from "./LanguageSelectorItems"; // Import the new component

export function LanguageSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="login-language-button">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Changer la langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <LanguageSelectorItems /> {/* Use the new component here */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}