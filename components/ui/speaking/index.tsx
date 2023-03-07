import React, {useState, useEffect} from 'react';
import styles from './speaking.module.css'

interface currentSpeakerProps {
    queue: string[],
};

interface timerProps {
    startedSpeaking: Date
};

function Timer(props: timerProps) {
    const { startedSpeaking } = props;
    const [elapsedTime, setElapsedTime] = useState<number>(0);
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        const now = new Date();
        const elapsedMilliseconds = now.getTime() - startedSpeaking.getTime();
        setElapsedTime(elapsedMilliseconds / 1000);
      }, 1000);
      return () => clearInterval(intervalId);
    }, [startedSpeaking]);
  
    return <p>Speaking Time: {elapsedTime.toFixed(0)}</p>;
  }

  export default function Speaker(props: currentSpeakerProps) {
    const { queue } = props;
    const [currentSpeaker, setCurrentSpeaker] = useState<string>(queue ? queue[0] : "Nobody");
    const [timeStartedSpeaking, setTimeStartedSpeaking] = useState<Date>(new Date());
  
    useEffect(() => {
      setCurrentSpeaker(queue ? queue[0] : "Nobody");
      setTimeStartedSpeaking(new Date());
    }, [queue]);
  
    return (
      <div className={styles.speakerDisplay}>
        <h1>{currentSpeaker}</h1>
        <p>is SpeakingUp!</p>
        {timeStartedSpeaking && <Timer startedSpeaking={timeStartedSpeaking} />}
      </div>
    );
  }
  