import React from 'react'
import OpenConv from '../components/OpenConv'
import Conversations from '../components/Conversations'
import { Navbar_SignIn } from '../components/Navbar_SignIn'
import '../styles/Chats.css'

export default function Chats() {
  return (
    <div className="chats-page">
      <Navbar_SignIn />

      <div className="chats-content">
        <div className="conversations-panel">
          <Conversations />
        </div>

        <div className="open-conversation-panel">
          <OpenConv />
        </div>
      </div>
    </div>
  )
}