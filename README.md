# front-state-core

extensible core state/state-context functionality for performant state keeping
for the front-work framework

the library is not meant to be used independently rather as a lower level
library to wrapped within custom functionality wrappers

## examples

### managing state contexts

```typescript
import state from "@front-work/state-utils";
import stateCore, {
  createContext,
  globalContext,
  removeContext,
  setContext,
} from "@front-work/state-core";

function meetingScopedStates(user: User) {
  const context = setContext(createContext(globalContext));

  const participants = state<User[]>();
  const chat = participants.to((list) => list.map((user) => user.chat));

  setContext(globalContext);

  function endMeeting() {
    removeContext(context);
  }

  function addParticipant(user: User) {
    participants.value = [...participants.value, user];
  }
  function removeParticipant(user: User) {
    participants.value = participants.filter(({ id }) => user.id !== id);
  }

  return {
    chats,
    addParticipant,
    removeParticipant,
    endMeeting,
  };
}
```

### managing un/registration, updates using stateCore

```typescript
import { IMut } from "@front-work/state-types";
import stateCore from "@front-work/state-core";

function countMinutes(): IState<number> {
  const { watch, unWatch, notify } = stateCore<number>();

  let value = 0;

  setState(() => {
    notify(value++, value);
  }, 1000);

  return {
    watch,
    unWatch,
    get value() {
      return value;
    },
  };
}
```
