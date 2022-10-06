import {
  CloseOutlined,
  FileImageOutlined,
  LineOutlined,
  LoadingOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { faSmileBeam } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Image, Input, Menu, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Picker from 'emoji-picker-react';
import moment from 'moment';
import { ChangeEvent, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { getAvatarMessage, getNameMessage } from '../../Helper/Chat';
import handleUpload from '../../Helper/UploadImage';
import useClickOutSide from '../../Hook/useClickOutSide';
import { RootState } from '../../index_Reducer';
import { IConversation, TypeActiveMessage, TypeMessage } from '../../Models/chat';
import ChangeInforConversation from '../../Pages/Chat/components/ChangeInfoConvesation';
import ChangeNicknameConversation from '../../Pages/Chat/components/ChangeNicknameConversation';
import {
  CHANGE_ACTIVE,
  GET_MESSAGE,
  SEND_MESSAGE,
  UNSEEN_CONVERSATION,
} from '../../Pages/Chat/constants';
import { IConversationActive } from '../../Pages/Chat/reducer';
import GroupAvatar from '../GroupAvatar';
import MessageText from '../MessageText';
import styles from './styles.module.css';

interface Props {
  conversation: IConversation;
}

export interface IImage {
  url: string;
  typeMedia: 'IMAGE' | 'VIDEO';
}

export default function ChatActiveItem({ conversation }: Props) {
  const dispatch = useDispatch();
  const [showPicker, setShowPicker] = useState(false);
  const [images, setImages] = useState<IImage[]>([]);
  const [contentModal, setContentModal] = useState<any>();
  const [loadingUploadImage, setLoadingUploadImage] = useState<boolean>(false);
  const active = useSelector(
    (state: RootState) => state.conversation.activeConversationsIds
  ) as IConversationActive[];
  const typeActive = active.find((i) => i._id === conversation._id)?.type;
  const isActive = typeActive === TypeActiveMessage.ACTIVE;
  const { refParent, refChildren } = useClickOutSide(() => {
    setShowPicker(false);
  });
  const onClose = (type?: TypeActiveMessage) => {
    dispatch({
      type: CHANGE_ACTIVE,
      payload: {
        conversationId: conversation._id,
        isActive: type,
      },
    });
  };

  const [text, setText] = useState('');

  const { messages, isLoadMore } = conversation;
  const onLoadMore = () => {
    let lastMessageId = undefined;
    if (messages && messages.length > 0) {
      lastMessageId = messages[messages.length - 1]._id;
    }

    dispatch({ type: GET_MESSAGE, payload: { conversationId: conversation._id, lastMessageId } });
  };

  useEffect(() => {
    onLoadMore();
  }, []);
  const user = useSelector((state: RootState) => state.login.user);
  const sendMessage = () => {
    if ((text.trim() || images.length > 0) && !loadingUploadImage) {
      dispatch({
        type: SEND_MESSAGE,
        payload: {
          message: {
            content: text.trim(),
            _id: Date.now().toString(),
            type: TypeMessage.MESSAGE,
            conversation: conversation._id,
            createdBy: {
              _id: user?._id,
              avatar: user?.avatar,
              fullName: user?.fullName,
            },
            status: 'LOADING',
            files: [...images],
          },
          conversationId: conversation._id,
        },
      });
    }

    setText('');
    setImages([]);
  };

  useEffect(() => {
    return () => {
      images.forEach((i) => {
        URL.revokeObjectURL(i.url);
      });
    };
  }, [images]);

  const onChangeImages = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      try {
        const currentFiles = e.target.files;
        const newArr = Array.from(currentFiles).map((item) => {
          return {
            url: URL.createObjectURL(item),
            typeMedia: item.type.includes('image') ? 'IMAGE' : 'VIDEO',
          } as IImage;
        });
        setLoadingUploadImage(true);
        setImages(newArr);
        const res = await Promise.all(
          Array.from(currentFiles).map((i) => {
            return handleUpload(i);
          })
        );
        const newArrAfterUpload = newArr.map((i, index) => {
          return {
            ...i,
            url: res[index].url,
          };
        });
        setImages(newArrAfterUpload);
      } catch (err) {
        setImages([]);
        console.log(err);
      } finally {
        setLoadingUploadImage(false);
      }
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="0">
        <div
          onClick={() => {
            setContentModal({
              component: (
                <ChangeInforConversation
                  conversation={conversation}
                  setContentModal={setContentModal}
                />
              ),
              title: 'Change name conversation',
            });
          }}
        >
          Change name conversation
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1">
        <div
          onClick={() => {
            setContentModal({
              component: (
                <ChangeNicknameConversation
                  conversation={conversation}
                  setContentModal={setContentModal}
                />
              ),
              title: 'Change nickname',
            });
          }}
        >
          Change nickname
        </div>
      </Menu.Item>
    </Menu>
  );

  const onEmojiClick = (_: any, emojiObject: any) => {
    setText(text + emojiObject.emoji);
  };
  const onFocus = () => {
    dispatch({
      type: UNSEEN_CONVERSATION,
      payload: { conversationId: conversation._id },
    });
  };
  return (
    <div className={styles['container']}>
      <div
        className={styles['header']}
        onClick={() => !isActive && onClose(TypeActiveMessage.ACTIVE)}
      >
        <Dropdown
          overlay={menu}
          trigger={['click']}
          overlayClassName={styles['dropdown']}
          placement="bottomLeft"
        >
          <div className={styles['infor']} onClick={() => {}}>
            <GroupAvatar
              size={40}
              style={{ width: 40, height: 40 }}
              src={getAvatarMessage(conversation, user!)}
            />
            <span className={styles['name']}>
              {getNameMessage(conversation, user!).slice(0, 15) +
                `${getNameMessage(conversation, user!).length > 15 ? '...' : ''}`}
            </span>
          </div>
        </Dropdown>
        <div className="flex">
          {isActive && (
            <div
              className={`${styles['icon-close']} hover-icon`}
              onClick={(e) => {
                e.stopPropagation();
                onClose(TypeActiveMessage.MINIMIZE);
              }}
            >
              <LineOutlined />
            </div>
          )}
          <div
            className={`${styles['icon-close']} hover-icon`}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <CloseOutlined />
          </div>
        </div>
      </div>
      <div style={{ display: isActive ? 'flex' : 'none' }} className={styles['content']}>
        <div className={styles['message']} id={conversation._id}>
          <InfiniteScroll
            dataLength={messages?.length ?? 0}
            next={onLoadMore}
            hasMore={isLoadMore}
            loader={<div>loading...</div>}
            scrollableTarget={conversation._id}
            style={{ display: 'flex', flexDirection: 'column-reverse' }}
            inverse
          >
            {messages &&
              messages.map((i, index) => {
                let endBlock = true;
                if (index > 0) {
                  if (messages[index - 1].type !== i.type) {
                    endBlock = true;
                  } else if (messages[index - 1].createdBy._id !== i.createdBy._id) {
                    endBlock = true;
                  } else {
                    endBlock =
                      moment(i.createdAt).diff(moment(messages[index - 1].createdAt), 'm') !== 0;
                  }
                }
                let startBlock = true;
                if (index < messages.length - 1) {
                  if (messages[index + 1].createdBy._id !== i.createdBy._id) {
                    startBlock = true;
                  } else {
                    startBlock =
                      moment(i.createdAt).diff(moment(messages[index + 1].createdAt), 'm') !== 0;
                  }
                }
                let isDifHalfDay = false;
                if (index === messages.length - 1) {
                  isDifHalfDay = true;
                } else if (index < messages.length - 1) {
                  isDifHalfDay =
                    moment(i.createdAt).diff(moment(messages[index + 1].createdAt), 'hour') > 12;
                }
                return (
                  <>
                    {i.type === 'NOTIFICATION' && <div className={styles['time']}>{i.content}</div>}
                    {i.type === 'MESSAGE' && (
                      <MessageText
                        message={i}
                        endBlock={endBlock}
                        startBlock={startBlock}
                        conversation={conversation}
                      />
                    )}
                    {isDifHalfDay && (
                      <div className={styles['time']}>
                        {moment(i.createdAt).format('MM/DD HH:mm')}
                      </div>
                    )}
                  </>
                );
              })}
          </InfiniteScroll>
        </div>
        {images.length > 0 && (
          <div className="flex">
            {images.map((i) => {
              return (
                <div className="relative flex">
                  {loadingUploadImage && (
                    <div className={styles['icon-loading']}>
                      <LoadingOutlined />
                    </div>
                  )}
                  <Image width={80} height={80} src={i.url} />
                </div>
              );
            })}
          </div>
        )}
        <div className={styles['input-wrapper']}>
          <div className="flex">
            <label className={`${styles['icon']} hover-icon`} htmlFor={conversation._id + 'images'}>
              <FileImageOutlined style={{ fontSize: 20 }} className={styles['icon-image']} />
            </label>
            <input
              multiple
              onChange={onChangeImages}
              id={conversation._id + 'images'}
              type="file"
              style={{ display: 'none' }}
            />
            <div className={`${styles['icon']} hover-icon`}>
              {showPicker && (
                <div className={styles['picker-emoij']} ref={refChildren}>
                  <Picker onEmojiClick={onEmojiClick} preload />
                </div>
              )}
              <div
                onClick={() => {
                  setShowPicker(!showPicker);
                }}
                ref={refParent}
              >
                <FontAwesomeIcon className={styles['icon-font']} icon={faSmileBeam} />
              </div>
            </div>
          </div>

          <Input.Group compact className={styles['input-wrapper']}>
            <TextArea
              className={styles['input']}
              value={text}
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder="please enter...."
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  sendMessage();
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
              onFocus={onFocus}
            />
            <Button type="ghost" onClick={sendMessage}>
              <SendOutlined />
            </Button>
          </Input.Group>
        </div>
      </div>
      <Modal
        visible={!!contentModal}
        onCancel={() => {
          setContentModal(null);
        }}
        footer={[]}
        title={contentModal?.title}
      >
        {contentModal?.component}
      </Modal>
    </div>
  );
}
