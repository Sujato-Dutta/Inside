import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface TestimonialAuthor {
  name: string;
  handle: string;
  avatar: string;
  role?: string;
}

export interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}

export function TestimonialCard({
  author,
  text,
  href,
  className,
}: TestimonialCardProps) {
  const Card = href ? "a" : "div";

  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-[#E3DED4]",
        "bg-white shadow-sm",
        "p-5 sm:p-6 text-start",
        "hover:border-orange-500/40",
        "w-[320px] sm:w-[380px] h-[250px] sm:h-[260px] shrink-0",
        "transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <Avatar className="h-11 w-11 sm:h-12 sm:w-12 border border-[#E3DED4] shadow-xs shrink-0">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="bg-orange-50 text-orange-600 font-bold">{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start min-w-0">
          <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1C1A17] leading-tight truncate">
            {author.name}
          </h3>
          <p className="text-[14.5px] sm:text-[15px] text-orange-600 font-semibold truncate mt-0.5">
            {author.role || author.handle}
          </p>
        </div>
      </div>
      <p className="mt-3.5 text-[15px] sm:text-[16px] text-[#5C5852] leading-relaxed font-normal flex-1 flex items-start line-clamp-5">
        {text}
      </p>
    </Card>
  );
}
