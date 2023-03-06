import styles from './nav.module.css'
import Link from 'next/link'



interface NavProps {

}

export default function Nav(props: NavProps) {

    return (
        <div className={styles.nav}>
            <Link href="/" style={{textDecoration: 'none'}}>
              <h2 style={{ margin: '10px 0' }}>SpeakUp!</h2>
            </Link>
            <span>
                
            </span>
        </div>
    );
}
