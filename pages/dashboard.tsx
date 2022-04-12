import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import { FC, useEffect } from "react"
import { useState } from "react"
import {
    Unlock as UnlockIcon,
    Lock as LockIcon,
    Copy as CopyIcon,
    Check as CheckIcon,
    Search as SearchIcon,
} from "react-feather"
import { withAuthPublic } from "utils/auth"
import { Octokit } from "octokit"

interface PageProps {
    user: {
        login: string
        fullname: string
        picture: string
        token: string
    }
}

interface Repo {
    id: number
    html_url: string
    description: string | null
    name: string
    full_name: string
    shareableLink?: string
    [property: string]: any
}

const PUBLIC_URI = process.env.NEXT_PUBLIC_URI

const Home: NextPage<PageProps> = ({ user }) => {
    const [repos, setRepos] = useState<Repo[]>([])

    useEffect(() => {
        async function getPrivateRepos() {
            const octokit = new Octokit({ auth: user.token })
            const { data } = await octokit.request("GET /user/repos", {
                visibility: "private",
            })
            setRepos(data)
        }
        getPrivateRepos()
    }, [user])

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <Head>
                <title>Dashboard</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header className="py-4 px-8 border-b border-gray-600 flex items-center justify-between">
                <div className="flex-1 flex items-center justify-center">
                    <form
                        className="border border-gray-600 rounded flex items-center"
                        onSubmit={(e) => {
                            e.preventDefault()
                        }}
                    >
                        <div className="py-2 px-4">
                            <SearchIcon size={16} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            placeholder="Search..."
                            className="py-2 pr-4 bg-transparent text-sm font-light focus:outline-none"
                        />
                    </form>
                </div>

                <div className="flex items-center space-x-4 w-fit">
                    <div>{user.login}</div>
                    <div>
                        <Image
                            className="rounded-full border border-gray-200"
                            src={
                                user.picture ||
                                "https://wallpaperaccess.com/full/4595683.jpg"
                            }
                            width={40}
                            height={40}
                            alt="Profile Pic"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-12 px-6">
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repos.map((repo) => (
                        <li
                            key={repo.id}
                            className="w-full max-w-sm mx-auto flex flex-col border border-gray-600 rounded shadow p-6 bg-black space-y-4"
                        >
                            <div className="flex justify-between items-start space-x-4">
                                <div className="flex-1">
                                    <h4 className="font-medium text-white">
                                        {repo.name}
                                    </h4>
                                    <small className="text-gray-400 text-xs">
                                        {repo.full_name}
                                    </small>
                                </div>
                                {repo.shareableLink ? (
                                    <button
                                        onClick={() => {
                                            setRepos((val) =>
                                                val.map((e) => {
                                                    if (e.id === repo.id) {
                                                        e.shareableLink =
                                                            undefined
                                                    }
                                                    return e
                                                })
                                            )
                                        }}
                                        className="p-1"
                                        title="Stop sharing"
                                    >
                                        <LockIcon size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setRepos((val) =>
                                                val.map((e) => {
                                                    if (e.id === repo.id) {
                                                        e.shareableLink = `${PUBLIC_URI}/share/${encodeURIComponent(
                                                            Buffer.from(
                                                                repo.html_url
                                                            ).toString("base64")
                                                        )}`
                                                    }
                                                    return e
                                                })
                                            )
                                        }}
                                        className="p-1"
                                        title="Get shareable link"
                                    >
                                        <UnlockIcon size={16} />
                                    </button>
                                )}
                            </div>
                            <p
                                className="flex-1 font-light text-sm line-clamp-2"
                                title={repo.description || ""}
                            >
                                {repo.description || ""}
                            </p>
                            {repo.shareableLink && (
                                <div className="flex">
                                    <div className="w-full border border-gray-600 bg-gray-800 text-sm truncate p-1">
                                        {repo.shareableLink}
                                    </div>
                                    <CopyButton>
                                        {repo.shareableLink}
                                    </CopyButton>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    )
}

const CopyButton: FC = ({ children }) => {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (copied) {
            setTimeout(() => setCopied(false), 3000)
        }
    }, [copied])

    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(String(children))
                setCopied(true)
            }}
            disabled={copied}
            title="Copy to clipboard"
            className="py-1 px-2 bg-gray-600"
        >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
    )
}

export const getServerSideProps = withAuthPublic()

export default Home
