"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setStatus(data.message));
  }, []);
  return <div className="container">APOYO ESCOLAR RV{status}</div>;
}
