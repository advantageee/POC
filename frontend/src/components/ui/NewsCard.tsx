import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import type { MCPEntry } from '@/types';

interface NewsCardProps {
  entry: MCPEntry;
}

export default function NewsCard({ entry }: NewsCardProps) {
  return (
    <Card className="hover:shadow-md">
      <CardHeader>
        <CardTitle>{entry.headline}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{entry.summary}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{entry.source}</span>
          <Link
            href={entry.link}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            Read more
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
