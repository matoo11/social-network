"use client";
import { useEffect } from "react";
import { InitWebSocket } from "../lib/api/websocket";

export default function WebSocketInit() {
  useEffect(() => {
    InitWebSocket(); // start once on client
  }, []);

  return null; // renders nothing
}
