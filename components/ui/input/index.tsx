import styles from './input.module.css'
import { ForwardedRef, forwardRef, HTMLProps, LegacyRef } from 'react';

type CustomInputProps = HTMLProps<HTMLInputElement> & { isValid?: boolean, ref?: ForwardedRef<HTMLInputElement> };
type CustomTextAreaProps = HTMLProps<HTMLTextAreaElement> & { isValid: boolean };


export default function CustomInput(props: CustomInputProps) {
  const borderStyle = props.isValid === false ? { border: '2px solid #cc0f35' } : {};

  return (
    <input type="text" {...props} className={`${props.className ? props.className : ''} ${styles.input}`} style={{ ...props.style, ...borderStyle }} />
  );
}

// export function useCustomInputProps(isValid?: boolean, className?: string) {
//   const borderStyle = (isValid === undefined) ? {} : isValid === false ? { border: '2px solid #cc0f35' } : {};
//   return {
//     className: className === undefined ? styles.input : `${className} ${styles.input}`,
//     style: borderStyle,
//   }
// }

export function InputLabel(props: HTMLProps<HTMLHeadingElement>) {
  if (!props.children) return null;
  return (<p {...props} className={`${props.className} ${styles.label}`}><label htmlFor={props.id}>{props.children}</label></p>);
}

export function InputInvalidMessage(props: HTMLProps<HTMLHeadElement> & { isValid: boolean }) {
  return !props.isValid ? <p style={{ color: "#cc0f35", marginTop: '0' }}>{props.children}</p> : null;
}


/**
 * 
 * @param props make sure to include name, id, placeholder, onChange
 * @returns 
 */
export function CustomTextArea(props: CustomTextAreaProps) {
  const borderStyle = props.isValid === false ? { border: '2px solid #cc0f35' } : {};

  return (
    <textarea rows={3} {...props} className={`${props.className ? props.className : ''} ${styles.input}`} style={borderStyle}></textarea>
  );
}