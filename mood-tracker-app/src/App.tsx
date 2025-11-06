import { useState, useEffect } from 'react'
import './App.css'

type CounterButtonProps = {
  label: string
  onClick: () => void
}

function CounterButton(props: CounterButtonProps) {
  return (
    <button onClick={props.onClick}>
      {props.label}
    </button>
  )
}

function App() {
  const [count, setCount] = useState(0)

  // countが変更されるたびに実行される
  useEffect(() => {
    console.log(`カウントが ${count} に変更されました`)
  }, [count])

  return (
    <div className="App">
      <h1>カウンターアプリ</h1>
      <div className="card">
        <p>現在のカウント: {count}</p>
        <CounterButton
          label="+1"
          onClick={() => setCount(count + 1)}
        />
        <CounterButton
          label="-1"
          onClick={() => setCount(count - 1)}
        />
        <CounterButton
          label="リセット"
          onClick={() => setCount(0)}
        />
      </div>
    </div>
  )
}

export default App