/// <reference types="monaco-editor" />
import { InfoRecord, LeanJsOpts, Message } from 'lean-client-js-browser';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Gptcom from "./gptcom.jsx"
import { createPortal, findDOMNode, render } from 'react-dom';
import * as sp from 'react-split-pane';
import { useSelector, useDispatch } from "react-redux";
import { allMessages, checkInputCompletionChange, checkInputCompletionPosition, currentlyRunning, delayMs,
  registerLeanLanguage, server, tabHandler } from './langservice';
import useCustomState from './useCustomState.js';
import { createStore } from "redux";
import { logInteraction } from './loggerService';
import rootReducer from "./redux/reducers";
import { RootState } from "./redux/types/types.js"
import { Provider } from "react-redux";
import { connect } from "react-redux";
import allActions from "./redux/actions";
// import TacGen from './TacGen.jsx';
import Nav from "./Nav.jsx"
interface TacGenProps {
  tactics: any[];
  predict: any;
}

const TacGen: React.ComponentType<TacGenProps> = require('./TacGen.jsx').default;
export const SplitPane: any = sp;
// console.log("please do not work");
function leanColorize(text: string): string {
  // TODO(gabriel): use promises
  const colorized: string = (monaco.editor.colorize(text, 'lean', {}) as any)._value;
  return colorized.replace(/&nbsp;/g, ' ');
}

interface MessageWidgetProps {
  msg: Message;
}
function MessageWidget({msg}: MessageWidgetProps) {
  const colorOfSeverity = {
    information: 'green',
    warning: 'orange',
    error: 'red',
  };
  // TODO: links and decorations on hover
  return (
    <div style={{paddingBottom: '1em'}}>
      <div className='info-header' style={{ color: colorOfSeverity[msg.severity] }}>
        {msg.pos_line}:{msg.pos_col}: {msg.severity}: {msg.caption}</div>
      <div className='code-block' dangerouslySetInnerHTML={{__html: leanColorize(msg.text)}}/>
    </div>
  );
}

interface Position {
  line: number;
  column: number;
}

interface GoalWidgetProps {
  goal: InfoRecord;
  position: Position;
}
function GoalWidget({goal, position}: GoalWidgetProps) {
  const tacticHeader = goal.text && <div className='info-header doc-header'>
    {position.line}:{position.column}: tactic {
      <span className='code-block' style={{fontWeight: 'normal', display: 'inline'}}>{goal.text}</span>}</div>;
  const docs = goal.doc && <ToggleDoc doc={goal.doc}/>;

  const typeHeader = goal.type && <div className='info-header'>
    {position.line}:{position.column}: type {
      goal['full-id'] && <span> of <span className='code-block' style={{fontWeight: 'normal', display: 'inline'}}>
      {goal['full-id']}</span></span>}</div>;
  const typeBody = (goal.type && !goal.text) // don't show type of tactics
    && <div className='code-block'
    dangerouslySetInnerHTML={{__html: leanColorize(goal.type) + (!goal.doc && '<br />')}}/>;

  const goalStateHeader = goal.state && <div className='info-header'>
    {position.line}:{position.column}: goal</div>;
  const goalStateBody = goal.state && <div className='code-block'
    dangerouslySetInnerHTML={{__html: leanColorize(goal.state) + '<br/>'}} />;

  return (
    // put tactic state first so that there's less jumping around when the cursor moves
    <div>
      {goalStateHeader}
      {goalStateBody}
      {tacticHeader || typeHeader}
      {typeBody}
      {docs}
    </div>
  );
}

interface ToggleDocProps {
  doc: string;
}
interface ToggleDocState {
  showDoc: boolean;
}
class ToggleDoc extends React.Component<ToggleDocProps, ToggleDocState> {
  constructor(props: ToggleDocProps) {
    super(props);
    this.state = { showDoc: this.props.doc.length < 80 };
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    this.setState({ showDoc: !this.state.showDoc });
  }
  render() {
    return <div onClick={this.onClick} className='toggleDoc'>
      {this.state.showDoc ?
        this.props.doc : // TODO: markdown / highlighting?
        <span>{this.props.doc.slice(0, 75)} <span style={{color: '#246'}}>[...]</span></span>}
        <br/>
        <br/>
    </div>;
  }
}

enum DisplayMode {
  OnlyState, // only the state at the current cursor position including the tactic state
  AllMessage, // all messages
}
// Define the type for your props
interface InfoViewProps {
  file: string;
  cursor: Position; // Define the Position type as per your application's requirements
  isPredicting?: boolean;
  dispatch?: Function; // Specify more accurate type if available
  goalState: any;
  generatedTactics: (tactics: any[]) => void;
  toggle: any;
}

// Define the type for your component's state
interface InfoViewClassState {
  goal: any; // Replace 'any' with a more specific type if available
  res: any; // Same here
  messages: Message[]; // Assuming 'Message' is a defined type
  displayMode: DisplayMode; // Ensure DisplayMode is properly defined/imported
  tactics: any[]; // Same here
  localToggle: boolean,
}

class InfoViewClass extends React.Component<InfoViewProps, InfoViewClassState> {
  private subscription: ReturnType<typeof server.allMessages.on>; // Adjust the type based on your actual subscription return type
  private timer: ReturnType<typeof setTimeout>;
  constructor(props: InfoViewProps) {
    super(props);
    this.state = {
      goal: null,
      res: null,
      messages: [],
      displayMode: DisplayMode.OnlyState,
      tactics: [],
      localToggle: this.props.toggle,
    };
  }

  
  componentDidMount() {
    this.updateMessages();
    this.timer = setTimeout(() => {
      this.updateMessages();
      this.refreshGoal();
    }, 100);

    this.subscription = server.allMessages.on((allMsgs) => {
      this.timer = setTimeout(() => {
        this.updateMessages();
        this.refreshGoal();
      }, 100);
    });
  }

  componentDidUpdate(prevProps,prevState) {
    if (this.props.cursor !== prevProps.cursor) {
      this.updateMessages();
      this.refreshGoal();
    }

    // if (this.state.goal) {
    //   this.generateTactic().then(() => {
    //     this.props.dispatch(allActions.updateTacticPrediction(false));
    //   });
    // }
    if (this.props.toggle !== prevProps.toggle) {
      this.setState({ localToggle: true });
    }

    if (this.state.goal && this.state.localToggle) {
      console.log(this.state.localToggle);
      this.generateTactic();
      // Reset the localToggle state to false after calling generateTactic
      this.setState({ localToggle: false });
    }

  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.subscription.dispose();
  }

  updateMessages = () => {
    this.setState({
      messages: allMessages.filter((v) => v.file_name === this.props.file)
    });
  };

  refreshGoal = () => {
    if (!this.props.cursor) {
      return;
    }

    const position = this.props.cursor;
    server.info(this.props.file, position.line, position.column).then((res) => {
      this.setState({
        goal: res.record && { goal: res.record, position }
      });
      this.props.goalState(this.state.goal.goal.state)
    });
  };

  generateTactic = async () => {
    const url = 'http://127.0.0.1:3000/api/generate_tactics';
    const proofState = this.state.goal.goal.state;
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
      this.setState({ tactics: tacticCandidates });
      this.props.generatedTactics(this.state.tactics);
      this.props.dispatch(allActions.textAction.clearText());
      this.props.dispatch(allActions.textAction.setText([tacticCandidates, proofState, this.props.cursor.line]));
    } catch (error) {
      console.error('Error:', error);
      this.setState({ tactics: [] });
    }
  };

  render() {
    const { goal, messages, displayMode } = this.state;
    const { cursor } = this.props;

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
          {/* Buttons for toggling display mode */}
        </div>
        {displayMode === DisplayMode.OnlyState && goal && (
          <div key={'goal'}>{GoalWidget(goal)}</div>
        )}
        {filteredMsgs.map((msg, i) => (
          <div key={i}>{MessageWidget({ msg })}</div>
        ))}
      </div>
    );
  }
}



interface PageHeaderProps {
  file: string;
  url: string;
  onSubmit: (value: string) => void;
  status: string;
  onSave: () => void;
  onLoad: (localFile: string, lastFileName: string) => void;
  clearUrlParam: () => void;
  onChecked: () => void;
}
interface PageHeaderState {
  currentlyRunning: boolean;
}
class PageHeader extends React.Component<PageHeaderProps, PageHeaderState> {
  private subscriptions: monaco.IDisposable[] = [];

  constructor(props: PageHeaderProps) {
    super(props);
    this.state = { currentlyRunning: true };
    this.onFile = this.onFile.bind(this);
    // this.restart = this.restart.bind(this);
  }

  componentWillMount() {
    this.updateRunning(this.props);
    this.subscriptions.push(
      currentlyRunning.updated.on((fns) => this.updateRunning(this.props)),
    );
  }
  componentWillUnmount() {
    for (const s of this.subscriptions) {
      s.dispose();
    }
    this.subscriptions = [];
  }
  componentWillReceiveProps(nextProps) {
    this.updateRunning(nextProps);
  }

  updateRunning(nextProps) {
    this.setState({
      currentlyRunning: currentlyRunning.value.indexOf(nextProps.file) !== -1,
    });
  }

  onFile(e) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.readAsText(file);
    reader.onload = () => this.props.onLoad(reader.result as string, file.name);
    this.props.clearUrlParam();
  }

  // This doesn't work! /test.lean not found after restarting
  // restart() {
  //   // server.restart();
  //   registerLeanLanguage(leanJsOpts);
  // }

  render() {
    const isRunning = this.state.currentlyRunning ? 'busy...' : 'ready!';
    const runColor = this.state.currentlyRunning ? 'orange' : 'lightgreen';
    // TODO: add input for delayMs
    // checkbox for console spam
    // server.logMessagesToConsole = true;
    return (
      <div className='wrap-collapsible'>
        <input id='collapsible' className='toggle' type='checkbox' defaultChecked={true}
        onChange={this.props.onChecked}/>
        <label style={{background: runColor}} htmlFor='collapsible' className='lbl-toggle' tabIndex={0}>
            Lean is {isRunning}
        </label>
        <div className='collapsible-content'><div className='leanheader'>
          <a href='https://leanprover.github.io'><img className='logo' src='./lean_logo.svg'
          style={{height: '5em', margin: '1ex', paddingLeft: '1em', paddingRight: '1em'}}/></a>
          <div className='headerForms'>
            <UrlForm url={this.props.url} onSubmit={this.props.onSubmit}
            clearUrlParam={this.props.clearUrlParam}/>
            <div style={{float: 'right', margin: '1em'}}>
              <button onClick={this.props.onSave}>Save</button>
              {/* <button onClick={this.restart}>Restart server:<br/>will redownload<br/>library.zip!</button> */}
            </div>
            <label className='logo' htmlFor='lean_upload'>Load .lean from disk:&nbsp;</label>
            <input id='lean_upload' type='file' accept='.lean' onChange={this.onFile}/>
            <div className='leanlink'>
              <Modal />&nbsp;
              <span className='logo'>Live in-browser version of the </span>
              <a href='https://leanprover.github.io/'>Lean theorem prover
              </a>
              <span className='logo'>.</span>
            </div>
            {this.props.status &&
              (<span style={{color: 'red'}}>
                Could not fetch (error: {this.props.status})!&nbsp;
                {this.props.status.startsWith('TypeError') && (<span>
                  If you see <a href='https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'>
                  cross-origin (CORS) errors
                </a> in your browser's dev console, try <a href='https://cors-anywhere.herokuapp.com/'>
                  a CORS proxy
                </a>, e.g. prepend https://cors-anywhere.herokuapp.com/ to the beginning of your URL.
                  </span>)}
              </span>)}
          </div>
        </div></div>
      </div>
    );
  }
}

interface UrlFormProps {
  url: string;
  onSubmit: (value: string) => void;
  clearUrlParam: () => void;
}
interface UrlFormState {
  value: string;
}
class UrlForm extends React.Component<UrlFormProps, UrlFormState> {
  constructor(props) {
    super(props);
    this.state = {value: this.props.url};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    this.props.clearUrlParam();
  }

  handleSubmit(event) {
    this.props.onSubmit(this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <div className='urlForm'>
      <form onSubmit={this.handleSubmit}>
        <span className='url'>Load .lean from&nbsp;</span>
        URL:&nbsp;<input type='text' value={this.state.value} onChange={this.handleChange}/>
        <input type='submit' value='Load' />
      </form></div>
    );
  }
}

interface ModalState {
  isOpen: boolean;
}
// https://assortment.io/posts/accessible-modal-component-react-portals-part-1 & 2
// TODO: change focus back to button when modal closes
class Modal extends React.Component<{}, ModalState> {
  private modalNode: Node;
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.clickAway = this.clickAway.bind(this);
  }

  open() {
    this.setState({ isOpen: true }, () => {
    });
  }
  close() {
    this.setState({ isOpen: false });
  }
  keyDown({ keyCode }) {
    return keyCode === 27 && this.close();
  }
  clickAway(e) {
    if (this.modalNode && this.modalNode.contains(e.target)) { return; }
    this.close();
  }

  render() {
    return (
      <React.Fragment>
        <button className='modalButton' onClick={this.open}>?</button>
        {this.state.isOpen &&
        <ModalContent onClose={this.close} onKeyDown={this.keyDown} clickAway={this.clickAway}
          modalRef={(n) => this.modalNode = n}/>}
      </React.Fragment>
    );
  }
}

function ModalContent({ onClose, modalRef, onKeyDown, clickAway }) {
  const libinfo = []; // populated with info about included libraries
  if (info) {
    for (const k in info) {
      if (info.hasOwnProperty(k)) {
        const v = info[k];
        if (v.match(/^https:\/\/raw\.githubusercontent\.com/)) {
          const urlArray = v.slice(34).split('/').slice(0, 3);
          const commit = urlArray[2].slice(0, 8);
          urlArray.unshift('https://github.com');
          urlArray.splice(3, 0, 'tree');
          const url = urlArray.join('/');
          libinfo.push(<div key={libinfo.length - 1} className='code-block'
            style={{fontWeight: 'normal'}}>
            {k} : <a href={url}>{commit}</a>
            </div>);
        } else {
          libinfo.push(<div key={libinfo.length - 1} className='code-block'
          style={{fontWeight: 'normal'}}>
          {k} : {v}
          </div>);
        }
      }
    }
  }

  return createPortal(
    <aside className='c-modal-cover' tabIndex={-1} onClick={clickAway} onKeyDown={onKeyDown}>
      <div className='c-modal' ref={modalRef}>
        <h1>Lean web editor:</h1>
        <button className='c-modal__close' onClick={onClose} autoFocus>
          <span className='u-hide-visually'>Close</span>
          <svg className='c-modal__close-icon' viewBox='0 0 40 40'>
          <path d='M 10,10 L 30,30 M 30,10 L 10,30'></path></svg>
        </button>
        <div className='c-modal__body'>
          <p>This page runs a WebAssembly or JavaScript version of <a href='https://leanprover.github.io'>Lean
          3</a>, a theorem prover and programming language developed
          at <a href='https://research.microsoft.com/'>Microsoft Research</a>.</p>

          <h3>New to Lean?</h3>
          <p>Please note that this editor is not really meant for serious use.
          Most Lean users use the Lean VS Code or Emacs extensions to write proofs and programs.
          There are good installation guides for Lean 3 and its standard library "mathlib"&nbsp;
          <a href='https://leanprover-community.github.io/get_started.html'>here</a>.
          The books <a href='https://leanprover.github.io/theorem_proving_in_lean'>Theorem Proving in Lean</a>&nbsp;
          and <a href='https://leanprover.github.io/logic_and_proof/'>Logic and Proof</a> are reasonable places
          to start learning Lean. For a more interactive approach,
          you might try <a href='http://wwwf.imperial.ac.uk/~buzzard/xena/natural_number_game/'>the
          "Natural number game"</a>. For more resources, see the&nbsp;
          <a href='https://leanprover-community.github.io/learn.html'>Learning Lean page</a>.
          If you have questions, drop by the&nbsp;
          <a href='https://leanprover.zulipchat.com/#'>leanprover zulip chat</a>.</p>

          <h3>Using this editor:</h3>
          <p>Type Lean code into the editor panel or load and edit a .lean file from the web or your computer
          using the input forms in the header.
          If there are errors, warnings, or info messages, they will be underlined in red or green in the editor
          and a message will be displayed in the info panel.</p>
          <p>You can input unicode characters by entering "\" and then typing the corresponding code (see below)
            and then either typing a space or a comma or hitting TAB.</p>
          <p>Here are a few common codes. Note that many other LaTeX commands will work as well:<br/>
            "lam" for "λ", "to" (or "-&gt;") for "→", "l" (or "&lt;-") for "←", "u" for "↑", "d" for "↓",
            "in" for "∈", "and" for "∧", "or" for "∨", "x" for "×",
            "le" and "ge" (or "&lt;=" and "&gt;=") for "≤" and "≥",
            "&lt;" and "&gt;" for "⟨" and "⟩",
            "ne" for "≠", "nat" for "ℕ", "not" for "¬", "int" for "ℤ",<br/>
            (For full details,
            see <a href='https://github.com/leanprover/vscode-lean/blob/master/translations.json'>this
              list</a>.)</p>
          <p>To see the type of a term, hover over it to see a popup, or place your cursor in the text to
          view the type and / or docstring in the info panel
          (on the right, or below, depending on your browser's aspect ratio).</p>
          <p>Click the colored bar to show / hide the header UI.</p>
          <p>Drag the separating line between the editor panel and info panels to adjust their relative sizes.</p>

          <h3>About this editor:</h3>
          <p><a href='https://github.com/leanprover-community/lean-web-editor/'>This editor</a> is a fork of the
          original <a href='https://leanprover.github.io/live'>lean-web-editor</a> app
          (written in TypeScript+React and using the Monaco
          editor; see the original GitHub repository <a href='https://github.com/leanprover/lean-web-editor'>here</a>).
          This page also uses <a href='https://github.com/bryangingechen/lean-client-js/tree/cache'>a forked
          version</a> of the <a href='https://github.com/leanprover/lean-client-js'>lean-client-browser</a> package
          that caches the <code>library.zip</code> file
          in <a href='https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API'>IndexedDB</a>.</p>
          <h3>Lean packages in library.zip:</h3>
          {libinfo}
          <h3>Settings:</h3>
          <p><input id='showUnderlines' type='checkbox' defaultChecked={!document.getElementById('hideUnderline')}
          onChange={(e) => {
            if (!e.target.checked && !document.getElementById('hideUnderline')) {
              const style = document.createElement('style');
              style.type = 'text/css';
              style.id = 'hideUnderline';
              style.appendChild(document.createTextNode(`.monaco-editor .greensquiggly,
              .monaco-editor .redsquiggly { background-size:0px; }`));
              document.head.appendChild(style);
              window.localStorage.setItem('underline', 'true');
            } else if (document.getElementById('hideUnderline')) {
              document.getElementById('hideUnderline').remove();
              window.localStorage.setItem('underline', 'false');
            }
          }}/> <label htmlFor='showUnderlines'>
            Decorate code with squiggly underlines for errors / warnings / info</label></p>
            <p><input id='showDocs' type='checkbox' defaultChecked={!document.getElementById('hideDocs')}
          onChange={(e) => {
            if (!e.target.checked && !document.getElementById('hideDocs')) {
              const style = document.createElement('style');
              style.type = 'text/css';
              style.id = 'hideDocs';
              style.appendChild(document.createTextNode(`.toggleDoc, .doc-header { display:none; }`));
              document.head.appendChild(style);
              window.localStorage.setItem('docs', 'true');
            } else if (document.getElementById('hideDocs')) {
              document.getElementById('hideDocs').remove();
              window.localStorage.setItem('dosc', 'false');
            }
          }}/> <label htmlFor='showDocs'>
            Show tactic docs in info panel (regardless of whether this is checked,
            tactic docs can be viewed by hovering your cursor over the tactic name)</label></p>
          <h3>Debug:</h3>
          <p><input id='logToConsole' type='checkbox' defaultChecked={server.logMessagesToConsole} onChange={(e) => {
            server.logMessagesToConsole = e.target.checked;
            window.localStorage.setItem('logging', e.target.checked ? 'true' : 'false');
            console.log(`server logging ${server.logMessagesToConsole ?
              'start' : 'end'}ed!`);
          }}/> <label htmlFor='logToConsole'>
            Log server messages to console</label></p>
          <p><button onClick={(e) => {
            const req = indexedDB.deleteDatabase('leanlibrary');
            req.onsuccess = () => {
              console.log('Deleted leanlibrary successfully');
              (location.reload as (cache: boolean) => void)(true);
            };
            req.onerror = () => {
              console.log("Couldn't delete leanlibrary");
            };
            req.onblocked = () => {
              console.log("Couldn't delete leanlibrary due to the operation being blocked");
            };
          }}>Clear library cache and refresh</button></p>
          <p><button onClick={() => {
            if ((self as any).WebAssembly) {
              fetch(leanJsOpts.webassemblyJs, {cache: 'reload'})
                .then(() => fetch(leanJsOpts.webassemblyWasm, {cache: 'reload'}))
                .then(() => {
                console.log('Updated JS & WASM cache successfully');
                (location.reload as (cache: boolean) => void)(true);
              }).catch((e) => console.log(e));
            } else {
              fetch(leanJsOpts.javascript, {cache: 'reload'})
                .then(() => {
                console.log('Updated JS cache successfully');
                (location.reload as (cache: boolean) => void)(true);
              }).catch((e) => console.log(e));
            }
          }}>Clear JS/WASM cache and refresh</button></p>
        </div>
      </div>
    </aside>,
  document.body);
}

interface LeanEditorProps {
  file: string;
  initialValue: string;
  onValueChange?: (value: string) => void;
  initialUrl: string;
  onUrlChange?: (value: string) => void;
  clearUrlParam: () => void;
  generatedTactics: (tactics: any[]) => void;
  toggle: any;
}
interface LeanEditorState {
  cursor?: Position;
  split: 'vertical' | 'horizontal';
  url: string;
  status: string;
  size: number;
  checked: boolean;
  lastFileName: string;
  tactics: [],
  goal: any;

}
class LeanEditor extends React.Component<LeanEditorProps, LeanEditorState> {
  // handleGptcomInfo = (info) => {
  //   // Do something with the information received from Gptcom
  //   console.log('Received info from Gptcom:', info);
  // };
  
  model: monaco.editor.IModel;
  editor: monaco.editor.IStandaloneCodeEditor;
  constructor(props: LeanEditorProps) {
    super(props);
    this.state = {
      split: 'vertical',
      url: this.props.initialUrl,
      status: null,
      size: null,
      checked: true,
      lastFileName: this.props.file,
      tactics: [],
      goal : null, 
    };
    this.model = monaco.editor.createModel(this.props.initialValue, 'lean', monaco.Uri.file(this.props.file));
    this.model.updateOptions({ tabSize: 2 });
    this.model.onDidChangeContent((e) => {
      checkInputCompletionChange(e, this.editor, this.model);
      const val = this.model.getValue();

      // do not change code URL param unless user has actually typed
      // (this makes the #url=... param a little more "sticky")
      return (!e.isFlush || !val) && this.props.onValueChange &&
        this.props.onValueChange(val);
    });

    this.updateDimensions = this.updateDimensions.bind(this);
    this.dragFinished = this.dragFinished.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onChecked = this.onChecked.bind(this);
  }
  componentDidMount() {
    /* TODO: factor this out */
    const ta = document.createElement('div');
    ta.style.fontSize = '1px';
    ta.style.lineHeight = '1';
    ta.innerHTML = 'a';
    document.body.appendChild(ta);
    const minimumFontSize = ta.clientHeight;
    ta.remove();
    const node = findDOMNode(this.refs.monaco) as HTMLElement;
    const DEFAULT_FONT_SIZE = 12;
    const options: monaco.editor.IEditorConstructionOptions = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      theme: 'vs',
      cursorStyle: 'line',
      automaticLayout: true,
      cursorBlinking: 'solid',
      model: this.model,
      minimap: {enabled: false},
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      fontSize: Math.max(DEFAULT_FONT_SIZE, minimumFontSize),
    };
    this.editor = monaco.editor.create(node, options);

    // context key which keeps track of whether unicode translation is possible
    const canTranslate = this.editor.createContextKey('canTranslate', false);
    this.editor.addCommand(monaco.KeyCode.Tab, () => {
      tabHandler(this.editor, this.model);
    }, 'canTranslate');
    this.editor.onDidChangeCursorPosition((e) => {
      canTranslate.set(checkInputCompletionPosition(e, this.editor, this.model));
      this.setState({cursor: {line: e.position.lineNumber, column: e.position.column - 1}});
    });

    this.determineSplit();
    window.addEventListener('resize', this.updateDimensions);
  }
  componentWillUnmount() {
    this.editor.dispose();
    this.editor = undefined;
    window.removeEventListener('resize', this.updateDimensions);
  }
  componentDidUpdate() {
    // if state url is not null, fetch, then set state url to null again
    if (this.state.url) {
      fetch(this.state.url).then((s) => s.text())
        .then((s) => {
          this.model.setValue(s);
          this.setState({ status: null });
        })
        .catch((e) => this.setState({ status: e.toString() }));
      this.setState({ url: null });
    }
  }

  updateDimensions() {
    this.determineSplit();
  }
  determineSplit() {
    const node = findDOMNode(this.refs.root) as HTMLElement;
    this.setState({split: node.clientHeight > 0.8 * node.clientWidth ? 'horizontal' : 'vertical'});
    // can we reset the pane "size" when split changes?
  }
  dragFinished(newSize) {
    this.setState({ size: newSize });
  }

  onSubmit(value) {
    const lastFileName = value.split('#').shift().split('?').shift().split('/').pop();
    this.props.onUrlChange(value);
    this.setState({ url: value, lastFileName });
  }

  onSave() {
    const file = new Blob([this.model.getValue()], { type: 'text/plain' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = this.state.lastFileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
  onLoad(fileStr, lastFileName) {
    this.model.setValue(fileStr);
    this.props.clearUrlParam();
    this.setState({ lastFileName });
  }

  onChecked() {
    this.setState({ checked: !this.state.checked });
  }
  goalState = (state) => {
    console.log("-----------------------------------------------------------");
      console.log(state);
      this.setState({ goal: state });
      
  }
  // generatedTactics = (tactics) =>{
  //   console.log(tactics);
  //   this.setState({tactics : tactics})
  // }
  render() {
    const infoStyle = {
      height: (this.state.size && (this.state.split === 'horizontal')) ?
        `calc(95vh - ${this.state.checked ? 115 : 0}px - ${this.state.size}px)` :
        (this.state.split === 'horizontal' ?
        // crude hack to set initial height if horizontal
          `calc(35vh - ${this.state.checked ? 45 : 0}px)` :
          '100%'),
      width: (this.state.size && (this.state.split === 'vertical')) ?
        `calc(98vw - ${this.state.size}px)` :
        (this.state.split === 'vertical' ? '38vw' : '99%'),
      };
    return (<div className='leaneditorContainer'>


      <div className="leaneditorContainerSplit">
      {/* <div className='headerContainer'>
        <PageHeader file={this.props.file} url={this.props.initialUrl}
        onSubmit={this.onSubmit} clearUrlParam={this.props.clearUrlParam} status={this.state.status}
        onSave={this.onSave} onLoad={this.onLoad} onChecked={this.onChecked}/>
      </div> */}
      <div className='editorContainer' ref='root'>
        <SplitPane split="horizontal" defaultSize='60%' allowResize={true}
        onDragFinished={this.dragFinished}>
          <div ref='monaco' className='monacoContainer'/>
          <div className='infoContainer' style={infoStyle}>
            <InfoViewClass  file={this.props.file} cursor={this.state.cursor} goalState={this.goalState} generatedTactics={this.props.generatedTactics} toggle={this.props.toggle}/>
          </div>
        </SplitPane>
      </div>
      </div>
    </div>);
  }
}

const defaultValue =
``;

interface HashParams {
  url: string;
  code: string;
}
function parseHash(hash: string): HashParams {
  hash = hash.slice(1);
  const hashObj = hash.split('&').map((s) => s.split('='))
    .reduce( (pre, [key, value]) => ({ ...pre, [key]: value }), {} ) as any;
  const url = decodeURIComponent(hashObj.url || '');
  const code = decodeURIComponent(hashObj.code || defaultValue);
  return { url, code };
}
function paramsToString(params: HashParams): string {
  let s = '#';
  if (params.url) {
    s = '#url=' + encodeURIComponent(params.url)
      .replace(/\(/g, '%28').replace(/\)/g, '%29');
  }
  // nonempty params.code will wipe out params.url
  if (params.code) {
    params.url = null;
    s = '#code=' + encodeURIComponent(params.code)
      .replace(/\(/g, '%28').replace(/\)/g, '%29');
  }
  return s;
}

// function changeUrlGPT(codeurl, key) {
//   console.log(codeurl)
//   history.replaceState(undefined, undefined,codeurl);
// }

function App() {
  const initUrl = new URL(window.location.href);
  const params = parseHash(initUrl.hash);
  const [tactics, setTactics] = useState([]);
  const [toggle, setToggle] = useState(false);

  function changeUrl(newValue, key) {
    params[key] = newValue;
    console.log(newValue);
    console.log(params);
    // if we just loaded a url, wipe out the code param
    if (key === 'url' || !newValue) {
      params.code = null;
    }
    console.log(paramsToString(params));
    history.replaceState(undefined, undefined, paramsToString(params));
  }

  function clearUrlParam() {
    params.url = null;
    history.replaceState(undefined, undefined, paramsToString(params));
  }

  // Function to handle info received from Gptcom
  const handleGptcomInfo = (info) => {
    // Do something with the information received from Gptcom
    console.log('Received info from Gptcom:', info);

    // Update the URL or perform other actions based on the info received
    changeUrl(info, 'code');
    changeUrl(info, 'url');
  };

  const fn = monaco.Uri.file('test.lean').fsPath;

  if (window.localStorage.getItem('underline') === 'true') {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'hideUnderline';
    style.appendChild(document.createTextNode(`.monaco-editor .greensquiggly,
    .monaco-editor .redsquiggly { background-size:0px; }`));
    document.head.appendChild(style);
  }

  if (window.localStorage.getItem('docs') === 'true') {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'hideDocs';
    style.appendChild(document.createTextNode(`.toggleDoc, .doc-header { display:none; }`));
    document.head.appendChild(style);
  }
  const generatedTactics = (tactics) => {
    console.log("***********^^^^^^^^^^^^^^^^^&&&&&&&&&&&&&################")
    console.log(tactics);
    setTactics(tactics);
  };  

  return (
    <div className="leanFlex">
      <LeanEditor
        file={fn}
        initialValue={params.code}
        onValueChange={(newValue) => changeUrl(newValue, 'code')}
        initialUrl={params.url}
        onUrlChange={(newValue) => changeUrl(newValue, 'url')}
        clearUrlParam={clearUrlParam}
        generatedTactics={generatedTactics}
        toggle={toggle}
      />
      <div className="GPTcontainer">
      <TacGen tactics={tactics as any[]} predict={()=>setToggle(!toggle)} />
      </div>
    </div>
  );
}

const hostPrefix = './';

const leanJsOpts: LeanJsOpts = {
  javascript: hostPrefix + 'lean_js_js.js',
  libraryZip: hostPrefix + 'library.zip',
  libraryMeta: hostPrefix + 'library.info.json',
  libraryOleanMap: hostPrefix + 'library.olean_map.json',
  libraryKey: 'library',
  webassemblyJs: hostPrefix + 'lean_js_wasm.js',
  webassemblyWasm: hostPrefix + 'lean_js_wasm.wasm',
  dbName: 'leanlibrary',
};

let info = null;
const metaPromise = fetch(leanJsOpts.libraryMeta)
  .then((res) => res.json())
  .then((j) => info = j);

// tslint:disable-next-line:no-var-requires
const store = createStore(rootReducer);
(window as any).require(['vs/editor/editor.main'], () => {
  registerLeanLanguage(leanJsOpts);
  render(
    <Provider store={store}>
      <Nav />
      <App />
    </Provider>,
      document.getElementById('root'),
  );
});