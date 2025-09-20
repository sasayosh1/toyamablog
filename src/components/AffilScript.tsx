"use client";

import Script from "next/script";

export default function AffilScript() {
  // 公開パスに置いた affiliates.json を読み込んで、data-affil を置換
  const inline = `
  (function(){
    const JSON_URL = "/affiliates.json";

    function createAffilNode(item){
      const wrap = document.createElement("div");
      wrap.className = "affil-cta";
      wrap.innerHTML = [
        '<a href="'+item.href+'" rel="sponsored noopener nofollow">'+
        item.label + '</a>',
        '<div style="font-size:12px;opacity:.7;margin-top:4px;">'+(item.note||"※PRを含みます")+'</div>',
        item.pixel ? '<img src="'+item.pixel+'" width="1" height="1" alt="" style="display:none;" />' : ''
      ].join("");
      return wrap;
    }

    function inject(dict){
      const map = Object.fromEntries(dict.map(x=>[x.id, x]));
      const usedCount = new Map(); // 同一IDの多重挿入を緩く抑制（最大2回）
      document.querySelectorAll("[data-affil]").forEach(ph=>{
        const id = ph.getAttribute("data-affil");
        const item = id ? map[id] : null;
        const n = usedCount.get(id) || 0;
        if(!item || n >= 2){ ph.remove(); return; }
        usedCount.set(id, n+1);
        const node = createAffilNode(item);
        ph.replaceWith(node);
      });
    }

    function ready(fn){
      if(document.readyState !== "loading") fn();
      else document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function(){
      fetch(JSON_URL, {cache: "no-store"})
        .then(r=>r.json())
        .then(inject)
        .catch(console.error);
    });
  })();
  `;

  return <Script id="affil-inject" strategy="afterInteractive">{inline}</Script>;
}