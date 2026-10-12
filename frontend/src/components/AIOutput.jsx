import FormattedAIReport from './FormattedAIReport';
export default function AIOutput({ content, title, loading }) {
 return <FormattedAIReport response={content || null} title={title || 'AI Analysis'} loading={loading} />;
}
