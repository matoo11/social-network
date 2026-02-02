"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { InitWebSocket } from "../lib/api/websocket";

const authRoutes = ['/login', '/register'];

export default function WebSocketInit() {
  const pathname = usePathname();

  useEffect(() => {
    
    if (authRoutes.includes(pathname)) {
      return;
    }
    
    InitWebSocket();
  }, [pathname]);

  return null;
}
