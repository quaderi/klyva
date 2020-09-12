import { atom } from '../src/atom'
import { optic } from 'optics-ts'

test('isomorphisms work', done => {
  const myAtom = atom(0)
  const there = (a: number) => a + 1
  const back = (a: number) => a - 1
  const myFocus = myAtom.focus(optic<number>().iso(there, back))

  myFocus.subscribe(() => {})

  myAtom.update(1)
  expect(myAtom.getValue()).toEqual(1)
  expect(myFocus.getValue()).toEqual(2)
  done()
})
