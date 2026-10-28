import { lazy, Suspense, type ComponentType } from "react";

export default function dynamic<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  opts?: { loading?: ComponentType },
) {
  const L = lazy(loader);
  const Fallback = opts?.loading;
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={Fallback ? <Fallback /> : null}>
        <L {...props} />
      </Suspense>
    );
  };
}
