import styles from './input.module.css'
import { ForwardedRef, forwardRef, HTMLProps, LegacyRef, useId } from 'react';
import { mdiCheck } from '@mdi/js';
import classNames from 'classnames';


type CustomInputProps = HTMLProps<HTMLInputElement> & { isValid?: boolean, ref?: ForwardedRef<HTMLInputElement> };
type CustomTextAreaProps = HTMLProps<HTMLTextAreaElement> & { isValid: boolean };

export default function Input(props: CustomInputProps) {
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
export function InputTextArea(props: CustomTextAreaProps) {
  const borderStyle = props.isValid === false ? { border: '2px solid #cc0f35' } : {};

  return (
    <textarea rows={3} {...props} className={`${props.className ? props.className : ''} ${styles.input}`} style={borderStyle}></textarea>
  );
}

// export function InputCheckbox(props: CustomInputProps & { label?: string }) {
//   const id = useId();

//   return (
//     <>
//       <span className={styles.checkboxContainer} style={{ color: props.isValid !== undefined && !props.isValid ? '#cc0f35' : undefined }}>
//         <input type='checkbox' id={id} {...props} className={`${styles.checkbox} ${props.isValid === undefined ? '' : !props.isValid ? styles.invalid : ''}`} />
//         {/* <svg viewBox="0 0 24 24" ><path fill="#eee" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg> */}
//         {props.label && <><label htmlFor={id}>{props.label}</label><br /></>}
//       </span>
//     </>
//   );
// }


export function InputCheckbox(props: CustomInputProps & { label?: string }) {
  const id = useId();

  return (
    <>
      <span className={classNames(styles.checkboxContainer, {
        [styles.checkboxContainerInvalid]: props.isValid === false,
      })}>
        <input type='checkbox' id={id} {...props} className={classNames(styles.checkbox, {
          [styles.checkboxInvalid]: props.isValid === false,
        })} />
        {props.label && <><label htmlFor={id}>{props.label}</label><br /></>}
      </span>
    </>
  );
}