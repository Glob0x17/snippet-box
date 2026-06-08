/// <reference types="vite/client" />

import type { JSX as ReactJSX } from 'react';

declare global {
  namespace JSX {
    type Element = ReactJSX.Element;
    type ElementClass = ReactJSX.ElementClass;
    interface ElementAttributesProperty
      extends ReactJSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute
      extends ReactJSX.ElementChildrenAttribute {}
    type LibraryManagedAttributes<C, P> = ReactJSX.LibraryManagedAttributes<
      C,
      P
    >;
    interface IntrinsicAttributes extends ReactJSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T>
      extends ReactJSX.IntrinsicClassAttributes<T> {}
    interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
  }
}

interface ImportMetaEnv {
  readonly VITE_AUTH_PROVIDER_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
