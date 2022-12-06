import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Silly Note-Taking App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Silly Note-Taking App
          </h1>
          <div className="flex flex-col items-center gap-2">
            <AuthShowcase />
          </div>
          {sessionData?.user && (
            <>
              <NoteForm />
              <NotesList />
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

const NoteForm: React.FC = () => {
  // Form to allow note-taking
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const utils = trpc.useContext();

  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setContent("");
      utils.notes.getAll.invalidate();
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await createNoteMutation.mutateAsync({ title, content });
      }}
    >
      <input
        className="w-full rounded-lg bg-white/10 px-4 py-2 text-white"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />
      <button type="submit" className="mt-2 rounded-md bg-white p-2">
        Save
      </button>
    </form>
  );
};

const NotesList = () => {
  const { data: sessionData } = useSession();
  const notesQuery = trpc.notes.getAll.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div>
      {notesQuery.data?.map((note) => (
        <div className="m-2 rounded-sm border border-blue-50 p-2" key={note.id}>
          <p className="font-semibold text-white">{note.title}</p>
          <p className="text-white">{note.content}</p>
        </div>
      ))}
    </div>
  );
};
