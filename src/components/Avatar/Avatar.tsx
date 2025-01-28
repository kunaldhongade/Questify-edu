import React, { CSSProperties, ReactNode } from "react";

interface AvatarProps {
  children: ReactNode;
  backgroundColor: string;
  px: string;
  py: string;
  color?: string;
  borderRadius: string;
  fontSize: string;
  cursor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  children,
  backgroundColor,
  px,
  py,
  color,
  borderRadius,
  fontSize,
  cursor,
}) => {
  const style: CSSProperties = {
    backgroundColor,
    padding: `${py} ${px}`,
    color: color || "black",
    borderRadius,
    fontSize,
    textAlign: "center",
    cursor: cursor || undefined,
    textDecoration: "none",
  };

  return <div style={style}>{children}</div>;
};

export default Avatar;
