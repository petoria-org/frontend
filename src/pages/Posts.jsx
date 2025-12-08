import React from 'react'
import {Navbar} from '../components/Navbar';
import AllPosts from '../components/AllPosts.jsx';
import '../styles/Posts.css'

export default function posts() {
  return (
    <div>
        <Navbar />
        <AllPosts />
    </div>
  )
}
