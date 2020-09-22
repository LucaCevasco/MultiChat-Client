/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useState } from 'react';
import { ApolloClient, 
	InMemoryCache,
	ApolloProvider, 
	useSubscription,
	useMutation,
	gql 
} from '@apollo/client';
import {
	Container,
	Row,
	Col,
	FormInput,
	Button
} from 'shards-react';
import { WebSocketLink } from '@apollo/client/link/ws';


const link = new WebSocketLink({
	uri: 'ws://localhost:4000/',
	options: {
		reconnect: true
	}
});


const client = new ApolloClient({
	link,
	uri: 'http://localhost:4000/',
	cache: new InMemoryCache()
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql`
  mutation ($user:String!, $content:String!) {
    postMessage(user: $user, content: $content)
  }
`;

// eslint-disable-next-line no-unused-vars
const Messages = ({ user }) => {
	const { data } = useSubscription(GET_MESSAGES);
	if (!data) return null;

	return (
		<>
			{data.messages.map(({ id, user: messageUser, content }) => (
				<div
					key={id}
					style={{
						display: 'flex',
						justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
						paddingBottom: '1em',
					}}
				>
					{
						user !== messageUser && (
							<div
								style={{
									height: 50,
									width: 50,
									marginRight: '0.5em',
									border: '2px solid #e5e6ea',
									borderRadius: 25,
									textAlign: 'center',
									fontSize: '18pt',
									paddingTop: 5,
								}}
							>
								{messageUser.slice(0,2).toUpperCase()}
							</div>
						)
					}
					<div
						style={{
							background: user === messageUser ? '#457b9d' : '#e5e6ea',
							color: user === messageUser ? '#fff' : '#000',
							padding: '1em',
							borderRadius: '1em',
							maxWidth: '60%',
						}}
					>
						{content}
					</div>
				</div>
			))}
		</>
	);
};

const Chat = () => {
	const [state, setState] = useState({
		user: 'jack',
		content: '',
	});
	const [postMessage] = useMutation(POST_MESSAGE);
	const onSend = () => {
		if(state.content.length > 0){
			postMessage({
				variables: state,
			});
		}
		setState({
			...state,
			content: '',
		});
	};

	return (
		<Container>
			<Messages user={state.user} />
			<Row>
				<Col xs={2} style={{padding: 0}}>
					<FormInput 
						label="user"
						value={state.user}
						onChange={(evt) => setState({
							...state,
							user: evt.target.value
						})}
					/>
				</Col>
				<Col xs={8} >
					<FormInput 
						label="Content"
						value={state.content}
						onChange={(evt) => setState({
							...state,
							content: evt.target.value
						})}
						onKeyUp={(evt) => {
							if(evt.keyCode === 13)
								onSend();
						}}
					/>
				</Col>
				<Col xs={2} >
					<Button onClick={() => onSend()}>
            send
					</Button>
				</Col>
			</Row>
		</Container>
	);
};

export default () => (
	<ApolloProvider client={client}>
		<Chat />
	</ApolloProvider>
);