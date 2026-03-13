import { useEffect, useRef } from "react";

interface PreviewFrameProps {
  html: string;
  css: string;
  js: string;
}

const PreviewFrame = ({ html, css, js }: PreviewFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = `<!DOCTYPE html>
<html>
<head>
<style>${css}</style>
</head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>`;

    const blob = new Blob([doc], { type: "text/html" });
    iframeRef.current.src = URL.createObjectURL(blob);
  }, [html, css, js]);

  return (
    <iframe
      ref={iframeRef}
      title="Preview"
      className="h-full w-full bg-foreground"
      sandbox="allow-scripts"
    />
  );
};

export default PreviewFrame;
