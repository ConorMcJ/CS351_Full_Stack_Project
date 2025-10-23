class TrieNode:
    """Node in a Trie data structure"""

    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.word = None


class Trie:
    """Trie data structure for efficient word storage and retrieval"""

    def __init__(self):
        """Initialize trie with root node"""
        self.root = TrieNode()

    def insert(self, word):
        """
        Insert a word into the trie
        Time Complexity: O(m) where m is word length
        Space Complexity: O(m) for new nodes
        """
        node = self.root

        for char in word.lower().strip():
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]

        node.is_end_of_word = True
        node.word = word.lower().strip()

    def build_from_answers(self, acceptable_answers):
        """
        Build trie from a list of acceptable answers

        Args:
            acceptable_answers: List of string answers
        """
        for answer in acceptable_answers:
            self.insert(answer)

    def search_prefix(self, prefix):
        """
        Search for all words with given prefix
        Time Complexity: O(m) where m is prefix length, then O(n) to collect results

        Args:
            prefix: String prefix to search for

        Returns:
            List of words matching the prefix
        """
        node = self.root

        # Navigate to the prefix node
        for char in prefix.lower().strip():
            if char not in node.children:
                return []
            node = node.children[char]

        # Collect all words from this node
        results = []
        self._dfs_collect(node, results)
        return results

    def _dfs_collect(self, node, results):
        """
        Helper function to collect all words from a node using DFS

        Args:
            node: Current TrieNode
            results: List to collect words
        """
        if node.is_end_of_word:
            results.append(node.word)

        for child in node.children.values():
            self._dfs_collect(child, results)
