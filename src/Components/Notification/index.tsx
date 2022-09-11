import { forwardRef } from 'react';
import styles from './styles.module.css';
export default forwardRef(function Notification(_, ref: any) {
  return (
    <div ref={ref} className={styles['notification-container']}>
      <div className="font-bold text-[25px] mb-[8px] ml-[12px]">Notifications</div>
      <div className={styles['notification-item']}>
        <div className="flex p-[4px]">
          <img
            alt="notification"
            src="https://www.w3schools.com/css/rock600x400.jpg"
            className={styles['image']}
          />
          <div className={styles['content']}>
            <div className={styles['title']}>
              container container container conta inerconta inerconta
            </div>
            <div className={styles['time']}>time</div>
          </div>
        </div>
      </div>
    </div>
  );
})
