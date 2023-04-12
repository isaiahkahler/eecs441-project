import React, { ButtonHTMLAttributes, CSSProperties, DetailedHTMLProps, HTMLProps, PropsWithChildren } from 'react'
import styles from './button.module.css'
import Link, { LinkProps } from 'next/link'

type ButtonProps = PropsWithChildren<HTMLProps<HTMLAnchorElement>>;

export default function Button(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
  return (
    <button type="button" {...props} className={styles.button} />
  );
}

export function SpanButton(props: ButtonProps) {
  return (
    <span {...props} className={styles.button}>
      {props.children}
    </span>
  );
}


export function LinkButton({ children, ...props }: PropsWithChildren<LinkProps>) {
  return (
    <Link {...props} className={styles.button}>
      {children}
    </Link>
  );
}

export function TransparentButton(props: ButtonProps) {
  return (
    <a {...props} className={styles.button} style={{ ...props.style, backgroundColor: 'transparent', border: '2px solid #000', ...props.style }}>
      {props.children}
    </a>
  );

}

export function IconButton(props: ButtonProps) {
  return (
    <a {...props} className={`${styles.button} ${styles.iconButton} ${props.className ? props.className : ''}`}>
      {props.children}
    </a>
  );
}

export function InputButton(props: HTMLProps<HTMLInputElement>) {
  return <input {...props} className={styles.button} style={{ fontSize: '1.5em', fontWeight: 'bold', padding: '1rem', ...props.style }} />;
}