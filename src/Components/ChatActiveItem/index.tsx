import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Button, Card, Divider, Input, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { SendOutlined, FileImageOutlined } from '@ant-design/icons';
import { IMessage, IConversation, TypeActiveMessage, TypeMessage } from '../../Models/chat';
import MessageText from '../MessageText';
import { CHANGE_ACTIVE, GET_MESSAGE, SEND_MESSAGE } from '../../Pages/Chat/constants';
import { useDispatch, useSelector } from 'react-redux';
import GroupAvatar from '../GroupAvatar';
import { getAvatarMessage, getNameMessage } from '../../Helper/Chat';
import { RootState } from '../../index_Reducer';
import { IConversationActive } from '../../Pages/Chat/reducer';
import InfiniteScroll from 'react-infinite-scroll-component';

interface Props {
  conversation: IConversation;
}

export default function ChatActiveItem({ conversation }: Props) {
  const dispatch = useDispatch();
  const active = useSelector(
    (state: RootState) => state.conversation.activeConversationsIds
  ) as IConversationActive[];
  const typeActive = active.find((i) => i._id === conversation._id)?.type
  const isActive = typeActive === TypeActiveMessage.ACTIVE
  const onClose = (type?: TypeActiveMessage) => {
    dispatch({
      type: CHANGE_ACTIVE,
      payload: {
        conversationId: conversation._id,
        isActive: type,
      },
    });
  };

  const [text, setText] = useState('')

  const { messages, isLoadMore } = conversation
  const onLoadMore = () => {
    let lastMessageId = undefined;
    if (messages && messages.length > 0) {
      lastMessageId = messages[messages.length - 1]._id
    }
    dispatch({ type: GET_MESSAGE, payload: { conversationId: conversation._id, lastMessageId } })
  }

  useEffect(() => {
    onLoadMore()
  }, [])
  const user = useSelector((state: RootState) => state.login.user)
  const sendMessage = () => {
    dispatch({
      type: SEND_MESSAGE, payload: {
        message: {
          content: text,
          _id: Date.now().toString(),
          type: TypeMessage.TEXT,
          conversation: conversation._id,
          createdBy: {
            _id: user._id,
            avatar: user.avatar,
            fullName: user.fullName
          },
          status: "LOADING"
        },
        conversationId: conversation._id,
      }
    })

    setText('')
  }
  return (
    <div className={styles['container']}>
      <div className={styles['header']} onClick={() =>
        onClose(isActive ? TypeActiveMessage.MINIMIZE : TypeActiveMessage.ACTIVE)}>
        <div className={styles['infor']}>
          <GroupAvatar
            size={40}
            style={{ width: 40, height: 40 }}
            src={getAvatarMessage(conversation, user)}
          />
          <span className={styles['name']}>{getNameMessage(conversation, user)}</span>
        </div>
        <div className={styles['icon-close']} onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>
          <FontAwesomeIcon icon={faTimes} />
        </div>
      </div>
      <div style={{ display: isActive ? "flex" : "none" }} className={styles['content']}>
        <InfiniteScroll
          dataLength={messages?.length ?? 0}
          next={onLoadMore}
          hasMore={isLoadMore}
          loader={<div />}
          scrollableTarget={conversation._id}
        >
          <div className={styles['message']} id={conversation._id}>
            {messages && messages.map((i) => {
              return <MessageText message={i} />;
            })}
          </div>
        </InfiniteScroll>
        <div className={styles['input-wrapper']}>
          <div className="flex">
            <div className={styles['icon']}>
              <FileImageOutlined style={{ fontSize: 20 }} />
            </div>
            <div className={styles['icon']}>
              <FileImageOutlined style={{ fontSize: 20 }} />
            </div>
          </div>
          <Input.Group compact className={styles['input-wrapper']}>
            <Input className={styles['input']} value={text} onChange={(e) => setText(e.target.value)} />
            <Button type="ghost" onClick={sendMessage}>
              <SendOutlined />
            </Button>
          </Input.Group>
        </div>
      </div>
    </div>
  );
}
