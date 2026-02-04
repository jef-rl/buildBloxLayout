    # Registry Mechanics — NXT Framework

    This package uses a definition-driven architecture.

    - **Definitions (DTOs)** are serializable and Firestore-compatible.
    - **Implementations** are code (reducers, effects, view components, selectors).
    - **Runtime registries** are built by combining definitions + implementations.

    Core rules:

    - Definition DTOs contain no functions or DOM references.
    - Reducers (handlers) are pure functions: (state, action, config?) => nextState.
    - Effects are the only place for IO (network, persistence, timers, etc.).
    - Views are presenter-only Lit components that:
      - consume CoreContext via @lit/context
      - dispatch Actions via CoreContext.dispatch({ action, payload })
    - Registries never store DOM elements or mutate global state.
  