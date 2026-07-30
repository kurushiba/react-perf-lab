import { useState } from 'react'
import { posts, type Post } from './data/posts'

export function ModuleArray() {
  const [tab, setTab] = useState('all')
  const visible = posts.filter((p) => tab === 'all' || p.isFollowing)
  return <ul onClick={() => setTab('x')}>{visible.map((p) => <li key={p.id}>{p.authorName}</li>)}</ul>
}

function Inner({ items }: { items: Post[] }) {
  const [tab, setTab] = useState('all')
  const visible = items.filter((p) => tab === 'all' || p.isFollowing)
  return <ul onClick={() => setTab('x')}>{visible.map((p) => <li key={p.id}>{p.authorName}</li>)}</ul>
}
export function PropsArray() {
  return <Inner items={posts} />
}

export function StateArray() {
  const [items] = useState(posts)
  const [tab, setTab] = useState('all')
  const visible = items.filter((p) => tab === 'all' || p.isFollowing)
  return <ul onClick={() => setTab('x')}>{visible.map((p) => <li key={p.id}>{p.authorName}</li>)}</ul>
}
