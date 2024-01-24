"use client";

import MyEditor from "@/components/MyEditor";
import { useState, useEffect } from "react";
export default function Home() {
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <div>
      <MyEditor />
    </div>
  );
}
