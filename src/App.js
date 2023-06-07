import React, { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useSpeechSynthesis } from "react-speech-kit";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello I am Doc, how can I help you",
      sender: "Doc",
    },
  ]);

  const { speak } = useSpeechSynthesis();

  const [typing, setTyping] = useState(false);

  //message below is event object
  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    //update the messages array to display latest message
    //using below method because we cant update the state messages array using setMessages directly on message string
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);

    //set a typing indicator when bot types
    //send the message object to backend so that bot can respond
    await processMessageToBot(newMessage, newMessages);
  };
  //Defining the function to fetch and send data
  const processMessageToBot = async (chatMessage, chatMessages) => {
    await fetch(process.env.REACT_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatMessage),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        setMessages([
          ...chatMessages,
          {
            message: data.message,
            sender: data.sender,
          },
        ]);
        speak({ text: data.message });
      });
    setTyping(false);
  };

  //Initiallly the messages array will have this initial message
  //Each message is an object having two elements
  //then we render this array in MessagesList ui component to show the messages we have in the array
  return (
    <div className="App">
      <nav class="navbar navbar-dark bg-dark">
        <span class="navbar-brand mx-3  mb-0 h1">Doc Bot</span>
      </nav>
      <div className="container bot-box">
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={
                typing ? <TypingIndicator content="bot is typing" /> : null
              }
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput
              placeholder="Ask me something..."
              onSend={handleSend}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
