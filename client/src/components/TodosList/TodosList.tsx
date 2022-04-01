import cn from 'classnames'
import { useClient, useFilter } from '@logux/client/react'
import { createSyncMap } from '@logux/client'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'

import { ControlPanel } from '../ControlPanel/ControlPanel'
import { TextInput } from '../TextInput/TextInput'
import { ToggleAction } from '../ToggleAction/ToggleAction'
import { tasksStore } from '../../stores/tasks'
import { Filter, filterStore } from '../../stores/filter'
import { TodosListItem } from './TodosListItem'
import styles from './TodosList.module.css'

export const TodosList = (): JSX.Element => {
  const client = useClient()
  const filter = useStore(filterStore)
  const [editableItemId, setEditableItemId] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const itemLabelRefs: { [key: string]: HTMLInputElement | null } = {}

  const tasksFilter =
    filter !== Filter.all
      ? {
          completed: filter === Filter.completed
        }
      : undefined
  const tasks = useFilter(tasksStore, tasksFilter)

  const handleNewTaskInputChange = useCallback(event => {
    setNewTaskTitle(event.target.value)
  }, [])

  const handleItemOutsideClick = useCallback(
    event => {
      if (event.target === itemLabelRefs[editableItemId]) return

      setEditableItemId('')
    },
    [editableItemId]
  )

  const handleSubmit = useCallback(
    event => {
      event.preventDefault()

      createSyncMap(client, tasksStore, {
        id: nanoid(),
        text: newTaskTitle,
        completed: false
      })

      setNewTaskTitle('')
    },
    [newTaskTitle]
  )

  useEffect(() => {
    document.addEventListener('click', handleItemOutsideClick)

    return () => {
      document.removeEventListener('click', handleItemOutsideClick)
    }
  }, [editableItemId])

  return (
    <div className={styles.todosList}>
      <form onSubmit={handleSubmit}>
        <TextInput
          id="create-new-task"
          label="Create new task"
          placeholder="What needs to be done?"
          theme="flat"
          value={newTaskTitle}
          onChange={handleNewTaskInputChange}
        />
        <button type="submit" className={styles.createAction}>
          Create
        </button>
      </form>

      <div className={styles.toggleAction}>
        <ToggleAction />
      </div>

      {tasks.isLoading ? (
        <div className={cn(styles.note, styles.noteTypeSkeleton)}>
          <span className={styles.label} />
        </div>
      ) : (
        <ul className={styles.list}>
          {tasks.list.map(todo => (
            <TodosListItem
              id={todo.id}
              completed={todo.completed}
              text={todo.text}
            />
          ))}
        </ul>
      )}

      <ControlPanel />
    </div>
  )
}
