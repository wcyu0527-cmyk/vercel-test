// app/page.tsx

'use client' // 必須聲明為客戶端元件，因為我們要使用 useState/useEffect

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // 引入我們建立的連線實例

// 待辦事項的類型定義 (TypeScript)
interface Todo {
  id: number
  task: string
  is_complete: boolean
}

export default function TodoApp() {
  // 狀態：儲存待辦事項列表
  const [todos, setTodos] = useState<Todo[]>([])
  // 狀態：儲存使用者在輸入框輸入的文字
  const [newTask, setNewTask] = useState('')

  // 1. 讀取功能 (R: Read)
  const fetchTodos = async () => {
    // 從 'todos' 資料表選擇所有資料，並依據 id 排序
    const { data, error } = await supabase.from('todos').select('*').order('id', { ascending: true })
    if (error) {
      console.error('Error fetching todos:', error)
      return
    }
    setTodos(data as Todo[])
  }

  // 頁面載入時執行一次讀取
  useEffect(() => {
    fetchTodos()
  }, [])

  // 2. 新增功能 (C: Create)
  const addTodo = async () => {
    if (!newTask.trim()) return // 避免新增空任務

    // 將新任務插入到 'todos' 資料表
    const { error } = await supabase.from('todos').insert({ task: newTask })
    if (error) {
      console.error('Error adding todo:', error)
      return
    }

    setNewTask('') // 清空輸入框
    fetchTodos() // 重新載入列表以顯示新任務
  }

  // 3. 刪除功能 (D: Delete)
  const deleteTodo = async (id: number) => {
    // 依據 ID 刪除任務
    const { error } = await supabase.from('todos').delete().match({ id })
    if (error) {
      console.error('Error deleting todo:', error)
      return
    }
    fetchTodos() // 重新載入列表
  }

  // 4. 更新功能 (U: Update - 簡單版，僅切換完成狀態)
  const toggleComplete = async (todo: Todo) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !todo.is_complete })
      .match({ id: todo.id })
    
    if (error) {
      console.error('Error updating todo:', error)
      return
    }
    fetchTodos() // 重新載入列表
  }


  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">我的待辦事項 📋</h1>

      {/* 新增任務區塊 */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="輸入新的待辦事項..."
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && addTodo()} // 按下 Enter 也新增
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-150"
        >
          新增
        </button>
      </div>

      {/* 待辦事項列表區塊 */}
      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            {/* 任務文字與完成狀態 */}
            <span
              className={`flex-grow cursor-pointer ${todo.is_complete ? 'line-through text-gray-500' : 'text-gray-800'}`}
              onClick={() => toggleComplete(todo)}
            >
              {todo.task}
            </span>

            {/* 刪除按鈕 */}
            <button
              onClick={() => deleteTodo(todo.id)}
              className="ml-4 text-red-500 hover:text-red-700 transition duration-150 p-1 rounded-full hover:bg-red-100"
            >
              ❌
            </button>
          </li>
        ))}
        {todos.length === 0 && (
            <p className="text-center text-gray-400 mt-8">目前沒有待辦事項，快新增一個吧！</p>
        )}
      </ul>
    </div>
  )
}