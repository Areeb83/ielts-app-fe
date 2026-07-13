import { atom } from 'jotai';
import type { User } from '../api/types';

export const userAtom = atom<User | null>(null as User | null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
export const isAuthLoadingAtom = atom<boolean>(true);
