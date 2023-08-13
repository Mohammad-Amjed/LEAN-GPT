const InfoView = ({ file, cursor }) => {
    const [goal, setGoal] = useState(null);
    const [messages, setMessages] = useState([]);
    const [displayMode, setDisplayMode] = useState(DisplayMode.OnlyState);
    const [tactics, setTactics] = useState([]);
    const dispatch = useDispatch();
  
    useEffect(() => {
      updateMessages();
      const timer = setTimeout(() => {
        updateMessages();
        refreshGoal();
      }, 100);
      return () => clearTimeout(timer);
    }, [file]);
  
    useEffect(() => {
      const subscription = server.allMessages.on((allMsgs) => {
        const timer = setTimeout(() => {
          updateMessages();
          refreshGoal();
        }, 100);
        return () => clearTimeout(timer);
      });
  
      return () => subscription.dispose();
    }, []);
  
    useEffect(() => {
      if (cursor) {
        updateMessages();
        refreshGoal();
      }
    }, [cursor]);
  
    useEffect(() => {
      if (goal) {
        generateTactic();
      }
    }, [goal]);
  
    const updateMessages = () => {
      setMessages(allMessages.filter((v) => v.file_name === file));
    };
  
    const refreshGoal = () => {
      if (!cursor) {
        return;
      }
  
      const position = cursor;
      server.info(file, position.line, position.column).then((res) => {
        setGoal(res.record && { goal: res.record, position });
      });
    };
  
    const generateTactic = async () => {
      const url = 'http://127.0.0.1:5000/generate_tactics';
      const proofState = goal.goal.state;
      const data = { proof_state: proofState };
  
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const responseData = await response.json();
        const tacticCandidates = responseData.tactics;
        setTactics(tacticCandidates);
        dispatch(allActions.textAction.clearText());
        dispatch(allActions.textAction.setText([tacticCandidates]));
        console.log(tacticCandidates);
      } catch (error) {
        console.error('Error:', error);
        setTactics([]);
      }
    };
  
    const filteredMsgs = displayMode === DisplayMode.AllMessage
      ? messages
      : messages.filter(({ pos_col, pos_line, end_pos_col, end_pos_line }) => {
          if (!cursor) {
            return false;
          }
          const { line, column } = cursor;
          return (
            pos_line <= line &&
            (!end_pos_line || line === pos_line || line <= end_pos_line) &&
            (line !== pos_line || pos_col <= column) &&
            (line !== end_pos_line || end_pos_col >= column)
          );
        });
  
    return (
      <div style={{ overflow: 'auto', height: '100%' }}>
        <div className='infoview-buttons'>
          <img
            src='./display-goal-light.svg'
            title='Display Goal'
            style={{ opacity: displayMode === DisplayMode.OnlyState ? 1 : 0.25 }}
            onClick={() => {
              setDisplayMode(DisplayMode.OnlyState);
            }}
          />
          <img
            src='./display-list-light.svg'
            title='Display Messages'
            style={{ opacity: displayMode === DisplayMode.AllMessage ? 1 : 0.25 }}
            onClick={() => {
              setDisplayMode(DisplayMode.AllMessage);
            }}
          />
        </div>
        {displayMode === DisplayMode.OnlyState && goal && (
          <div key={'goal'}>{GoalWidget(goal)}</div>
        )}
        {filteredMsgs.map((msg, i) => (
          <div key={i}>{MessageWidget({ msg })}</div>
        ))}
      </div>
    );
  };
  
export default InfoView;  