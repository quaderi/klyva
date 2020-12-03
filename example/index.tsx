import * as React from 'react'
import * as ReactDOM from 'react-dom'
import 'todomvc-app-css/index.css'
import {
  atom,
  focusAtom,
  useAtom,
  useAtomSlice,
  useSelector,
} from '../src/index'
import { PrimitiveAtom } from '../src/types'

const CheckBox = ({ checkedAtom }: { checkedAtom: PrimitiveAtom<boolean> }) => {
  const checked = useSelector(checkedAtom)
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => checkedAtom.update(!checked)}
    />
  )
}

const TextInput = ({ textAtom }: { textAtom: PrimitiveAtom<string> }) => {
  const text = useSelector(textAtom)
  return (
    <input
      type="text"
      value={text}
      onChange={event => textAtom.update(event.target.value)}
    />
  )
}
type TodoType = { task: string; checked: boolean }
const TodoItem = ({
  todoAtom,
  onRemove,
}: {
  todoAtom: PrimitiveAtom<TodoType>
  onRemove: () => void
}) => {
  const checkedAtom = focusAtom(todoAtom, optic => optic.prop('checked'))
  const textAtom = focusAtom(todoAtom, optic => optic.prop('task'))
  return (
    <>
      <CheckBox checkedAtom={checkedAtom} />
      <TextInput textAtom={textAtom} />
      <button onClick={onRemove}>X</button>
    </>
  )
}

const TodoList = ({
  todoListAtom,
}: {
  todoListAtom: PrimitiveAtom<TodoListAtomType>
}) => {
  const todosAtom = focusAtom(todoListAtom, optic => optic.prop('todos'))
  const filter = useSelector(todoListAtom, value => value.filter)
  const filteredTodos = focusAtom(todosAtom, optic =>
    optic
      .indexed()
      .filter(
        ([index, { checked }]) =>
          filter === 'all' ||
          (filter === 'completed' && checked) ||
          (filter === 'uncompleted' && !checked),
      ),
  )
  const todoAtoms = useAtomSlice(filteredTodos)
  const [newTodo, setNewTodo] = React.useState('')

  return (
    <>
      <input
        value={newTodo}
        placeholder="New todo"
        onKeyUp={e => {
          if (e.key === 'Enter') {
            todosAtom.update(todos => [
              { task: newTodo, checked: false },
              ...todos,
            ])
            setNewTodo('')
          }
        }}
        onChange={event => {
          setNewTodo(event.target.value)
        }}
      />
      <ul>
        {todoAtoms.map((todoAtom, index) => (
          <li key={index}>
            <TodoItem
              key={index}
              todoAtom={focusAtom(todoAtom, optic => optic.nth(1))}
              onRemove={todoAtom.remove}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
type FilterType = 'all' | 'completed' | 'uncompleted'
type TodoListAtomType = {
  filter: FilterType
  todos: Array<TodoType>
}
const todoListAtom = atom<TodoListAtomType>({
  filter: 'all',
  todos: [
    { task: 'Handle the dragon', checked: false },
    { task: 'Drink some water', checked: false },
  ],
})

const Filter = ({ filterAtom }: { filterAtom: PrimitiveAtom<FilterType> }) => {
  const filter = useAtom(filterAtom)
  return (
    <>
      <div onClick={() => filterAtom.update('all')}>
        <input type="radio" readOnly checked={filter === 'all'} />
        <label htmlFor="all">All</label>
      </div>
      <div onClick={() => filterAtom.update('completed')}>
        <input type="radio" readOnly checked={filter === 'completed'} />
        <label>Completed</label>
      </div>
      <div onClick={() => filterAtom.update('uncompleted')}>
        <input type="radio" readOnly checked={filter === 'uncompleted'} />
        <label htmlFor="uncompleted">Uncompleted</label>
      </div>
    </>
  )
}

const App = () => {
  const filterAtom = focusAtom(todoListAtom, optic => optic.prop('filter'))
  return (
    <div>
      <TodoList todoListAtom={todoListAtom} />
      <Filter filterAtom={filterAtom} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
