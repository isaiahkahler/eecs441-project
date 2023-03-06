import { CSSProperties } from "react";

interface LayoutProps {
    children?: React.ReactNode,
    style?: CSSProperties,
};

export default function Layout(props: LayoutProps) {
    return (
        <div style={{width: "100vw", padding: "3rem 1.5rem", ...props.style}}>
            {props.children}
        </div>
    );
}