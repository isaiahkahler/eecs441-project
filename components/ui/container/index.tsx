import { CSSProperties } from "react";
import styles from './container.module.css'

interface ContainerProps {
    children?: React.ReactNode,
    style?: CSSProperties
}

export default function Container(props: ContainerProps) {
    return (
        <div className={styles.container} style={{...props.style}}>
            <div className={styles.inner}>
                {props.children}
            </div>
        </div>
    );
}