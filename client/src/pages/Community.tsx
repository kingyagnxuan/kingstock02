import DashboardLayout from "@/components/DashboardLayout";
import CommunityDiscussion from "@/components/CommunityDiscussion";
import MarketNewsAndQuotes from "@/components/MarketNewsAndQuotes";
import { mockDiscussionThreads, mockDiscussionReplies, mockMarketNews } from "@/lib/mockCommunityData";
import { MessageSquare } from "lucide-react";

export default function Community() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            社区中心
          </h2>
          <p className="text-muted-foreground">
            分享交易心得、讨论涨停逻辑、获取最新市场资讯
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Discussion Area */}
          <div className="lg:col-span-2">
            <CommunityDiscussion
              threads={mockDiscussionThreads}
              replies={mockDiscussionReplies}
            />
          </div>

          {/* Sidebar - News and Hot Topics */}
          <div className="space-y-6">
            <MarketNewsAndQuotes news={mockMarketNews} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
