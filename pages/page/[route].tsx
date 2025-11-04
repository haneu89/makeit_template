import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Page } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

interface PageProps {
  page: Page | null;
}

export default function PageRoute({ page }: PageProps) {
  const router = useRouter();

  useEffect(() => {
    if (!page) {
      router.push('/404');
    }
  }, [page, router]);

  if (!page) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            {page.title}
          </h1>
          <div 
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none
              prose-headings:text-gray-900
              prose-p:text-gray-600
              prose-a:text-blue-600 hover:prose-a:text-blue-800
              prose-strong:text-gray-900
              prose-ul:text-gray-600
              prose-ol:text-gray-600
              prose-li:marker:text-gray-400
              prose-blockquote:text-gray-600 prose-blockquote:border-gray-300
              prose-hr:border-gray-200
              prose-table:text-gray-600
              prose-th:text-gray-900
              prose-td:text-gray-600
              prose-img:rounded-lg
              prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100"
            dangerouslySetInnerHTML={{ __html: page.content || '' }}
          />
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const prisma = new PrismaClient();
  
  try {
    const route = params?.route as string;
    const page = await prisma.page.findFirst({
      where: { 
        route,
        domain: 'default'
      },
    });

    if (!page) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        page: JSON.parse(JSON.stringify(page)),
      },
    };
  } catch (error) {
    console.error('Page fetch error:', error);
    return {
      notFound: true,
    };
  } finally {
    await prisma.$disconnect();
  }
};
