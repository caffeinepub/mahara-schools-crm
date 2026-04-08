/**
 * Project-local useActor wrapper.
 *
 * The actual hook lives in @caffeineai/core-infrastructure.
 * This file re-exports it pre-bound to the generated `createActor` function
 * from backend.ts, so all pages can do:
 *
 *   import { useActor } from "../hooks/useActor";
 *   const { actor, isFetching } = useActor();
 *
 * and get a fully-typed Backend instance without needing to pass createActor.
 */

import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { type backendInterface, createActor } from "../backend";

export function useActor(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  return _useActor(createActor) as {
    actor: backendInterface | null;
    isFetching: boolean;
  };
}
